<script setup lang="ts">
import './toast-styles.css'
import { ToastRoot, ToastClose as RadixToastClose, type ToastRootEmits, type ToastRootProps, useForwardPropsEmits } from 'radix-vue'
import { computed, ref, onMounted, onUnmounted, type HTMLAttributes } from 'vue'
import { Icon } from '@iconify/vue'
import { type ToastVariants, toastVariants } from './toast-variants'
import { cn } from '../../../lib/utils'
import type { ToastSeverity } from '../../../composables/useToast'

const props = defineProps<ToastRootProps & {
    class?: HTMLAttributes['class']
    severity?: ToastSeverity
    duration?: number | null
    showProgress?: boolean
    closable?: boolean
    icon?: string
    pauseOnHover?: boolean
    createdAt?: number
}>()

const emits = defineEmits<ToastRootEmits>()

const delegatedProps = computed(() => {
    const { class: _, severity: __, duration: ___, showProgress: ____, closable: _____, icon: ______, pauseOnHover: _______, createdAt: ________, ...delegated } = props
    return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)

// Progress bar state
const isPaused = ref(false)
const remainingTime = ref(props.duration ?? 5000)
const progressWidth = ref(100)

let intervalId: ReturnType<typeof setInterval> | null = null
let startTime = props.createdAt ?? Date.now()

const startProgress = () => {
    if (props.duration === null || !props.showProgress) return

    const totalDuration = props.duration ?? 5000
    const updateInterval = 50

    intervalId = setInterval(() => {
        if (isPaused.value) return

        const elapsed = Date.now() - startTime
        remainingTime.value = Math.max(0, totalDuration - elapsed)
        progressWidth.value = (remainingTime.value / totalDuration) * 100
    }, updateInterval)
}

const pauseProgress = () => {
    if (props.pauseOnHover !== false) {
        isPaused.value = true
    }
}

const resumeProgress = () => {
    if (props.pauseOnHover !== false) {
        isPaused.value = false
        startTime = Date.now() - ((props.duration ?? 5000) - remainingTime.value)
    }
}

onMounted(() => {
    startProgress()
})

onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
})

// Auto-select icon based on severity
const effectiveIcon = computed(() => {
    if (props.icon) return props.icon
    switch (props.severity) {
        case 'success': return 'lucide:check-circle'
        case 'danger': return 'lucide:x-circle'
        case 'warn': return 'lucide:alert-triangle'
        case 'info': return 'lucide:info'
        case 'help': return 'lucide:help-circle'
        default: return null
    }
})
</script>

<template>
    <ToastRoot v-bind="forwarded" :class="cn(toastVariants({ severity: severity ?? 'default' }), props.class)"
        @mouseenter="pauseProgress" @mouseleave="resumeProgress">
        <div class="flex items-start gap-3 flex-1">
            <Icon v-if="effectiveIcon" :icon="effectiveIcon" class="toast-icon" />
            <div class="grid gap-1 flex-1">
                <slot name="content" />
            </div>
        </div>

        <!-- Action slot -->
        <slot name="action" />

        <!-- Close button - must be direct child of ToastRoot -->
        <RadixToastClose v-if="closable !== false"
            class="absolute right-2 top-2 rounded-md p-1 text-current/50 opacity-70 transition-opacity hover:opacity-100 hover:text-current focus:opacity-100 focus:outline-none focus:ring-2 cursor-pointer">
            <Icon icon="lucide:x" class="h-4 w-4" />
        </RadixToastClose>

        <!-- Progress bar -->
        <div v-if="showProgress && duration !== null" class="toast-progress" :style="{ width: `${progressWidth}%` }" />
    </ToastRoot>
</template>
