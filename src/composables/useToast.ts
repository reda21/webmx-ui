import type { Component, VNode, Ref } from 'vue'
import { reactive, toRefs, ref, computed, watch } from 'vue'

// ==================== Configuration ====================
const TOAST_LIMIT = 5
const DEFAULT_DURATION = 5000

// ==================== Types ====================
export type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

export type ToastSeverity =
    | 'default'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warn'
    | 'help'
    | 'danger'
    | 'contrast'

export type ToastProps = {
    id: string
    title?: string | VNode | Component
    titre?: string | VNode | Component // Alias for title
    description?: string | VNode | Component
    action?: VNode | Component
    open?: boolean
    onOpenChange?: (open: boolean) => void
    // New options
    position?: ToastPosition
    severity?: ToastSeverity
    duration?: number | null // null = permanent
    showProgress?: boolean
    closable?: boolean
    icon?: string
    pauseOnHover?: boolean
    createdAt?: number
}

type ToasterToast = ToastProps & {
    id: string
}

const actionTypes = {
    ADD_TOAST: 'ADD_TOAST',
    UPDATE_TOAST: 'UPDATE_TOAST',
    DISMISS_TOAST: 'DISMISS_TOAST',
    REMOVE_TOAST: 'REMOVE_TOAST',
} as const

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

type ActionType = typeof actionTypes

type Action =
    | {
        type: ActionType['ADD_TOAST']
        toast: ToasterToast
    }
    | {
        type: ActionType['UPDATE_TOAST']
        toast: Partial<ToasterToast>
    }
    | {
        type: ActionType['DISMISS_TOAST']
        toastId?: ToasterToast['id']
    }
    | {
        type: ActionType['REMOVE_TOAST']
        toastId?: ToasterToast['id']
    }

interface State {
    toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const state = reactive<State>({
    toasts: [],
})

const addToRemoveQueue = (toastId: string, delay: number = 300) => {
    if (toastTimeouts.has(toastId)) {
        return
    }

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId)
        dispatch({
            type: 'REMOVE_TOAST',
            toastId: toastId,
        })
    }, delay)

    toastTimeouts.set(toastId, timeout)
}

const scheduleAutoDismiss = (toast: ToasterToast) => {
    if (toast.duration === null) return // Permanent toast

    const duration = toast.duration ?? DEFAULT_DURATION
    const timeout = setTimeout(() => {
        dispatch({ type: 'DISMISS_TOAST', toastId: toast.id })
    }, duration)

    toastTimeouts.set(`autodismiss-${toast.id}`, timeout)
}

const clearAutoDismiss = (toastId: string) => {
    const key = `autodismiss-${toastId}`
    const timeout = toastTimeouts.get(key)
    if (timeout) {
        clearTimeout(timeout)
        toastTimeouts.delete(key)
    }
}

function dispatch(action: Action) {
    switch (action.type) {
        case 'ADD_TOAST':
            // Group by position for limiting
            const position = action.toast.position || 'bottom-right'
            const toastsAtPosition = state.toasts.filter(t => (t.position || 'bottom-right') === position)

            if (toastsAtPosition.length >= TOAST_LIMIT) {
                // Remove oldest toast at this position
                const oldest = toastsAtPosition[toastsAtPosition.length - 1]
                dispatch({ type: 'DISMISS_TOAST', toastId: oldest.id })
            }

            state.toasts = [action.toast, ...state.toasts]
            scheduleAutoDismiss(action.toast)
            break

        case 'UPDATE_TOAST':
            state.toasts = state.toasts.map((t) =>
                t.id === action.toast.id ? { ...t, ...action.toast } : t
            )
            break

        case 'DISMISS_TOAST': {
            const { toastId } = action

            if (toastId) {
                clearAutoDismiss(toastId)
                addToRemoveQueue(toastId)
            } else {
                state.toasts.forEach((toast) => {
                    clearAutoDismiss(toast.id)
                    addToRemoveQueue(toast.id)
                })
            }

            state.toasts = state.toasts.map((t) =>
                t.id === toastId || toastId === undefined
                    ? {
                        ...t,
                        open: false,
                    }
                    : t
            )
            break
        }
        case 'REMOVE_TOAST':
            if (action.toastId === undefined) {
                state.toasts = []
            } else {
                state.toasts = state.toasts.filter((t) => t.id !== action.toastId)
            }
            break
    }
}

type Toast = Omit<ToasterToast, 'id'>

function toast({ ...props }: Toast) {
    const id = genId()
    const { titre, title, ...rest } = props
    const effectiveTitle = title ?? titre

    const update = (props: ToasterToast) =>
        dispatch({
            type: 'UPDATE_TOAST',
            toast: { ...props, id },
        })
    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id })

    dispatch({
        type: 'ADD_TOAST',
        toast: {
            position: 'bottom-right',
            severity: 'default',
            duration: DEFAULT_DURATION,
            showProgress: false,
            closable: true,
            pauseOnHover: true,
            ...rest,
            title: effectiveTitle,
            id,
            open: true,
            createdAt: Date.now(),
            onOpenChange: (open: boolean) => {
                if (!open) dismiss()
            },
        },
    })

    return {
        id: id,
        dismiss,
        update,
    }
}

// Helper functions for common toast types
toast.success = (title: string, description?: string, options?: Partial<Toast>) =>
    toast({ title, description, severity: 'success', icon: 'lucide:check-circle', ...options })

toast.error = (title: string, description?: string, options?: Partial<Toast>) =>
    toast({ title, description, severity: 'danger', icon: 'lucide:x-circle', ...options })

toast.warning = (title: string, description?: string, options?: Partial<Toast>) =>
    toast({ title, description, severity: 'warn', icon: 'lucide:alert-triangle', ...options })

toast.info = (title: string, description?: string, options?: Partial<Toast>) =>
    toast({ title, description, severity: 'info', icon: 'lucide:info', ...options })

export interface UseToastReturn {
    toasts: Ref<ToasterToast[]>
    toast: typeof toast
    dismiss: (toastId?: string) => void
}

function useToast(): UseToastReturn {
    const { toasts } = toRefs(state)
    return {
        toasts,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
    }
}

export { useToast, toast }
export type { ToasterToast, Toast }
