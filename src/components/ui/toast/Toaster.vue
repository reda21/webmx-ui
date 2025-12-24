<script setup lang="ts">
import { computed } from 'vue'
import { useToast, type ToastPosition } from '../../../composables/useToast'
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '.'

const props = withDefaults(defineProps<{
    position?: ToastPosition
}>(), {
    position: 'bottom-right',
})

const { toasts } = useToast()

// Group toasts by position
const positions: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
]

const toastsByPosition = computed(() => {
    const grouped: Record<ToastPosition, typeof toasts.value> = {
        'top-left': [],
        'top-center': [],
        'top-right': [],
        'bottom-left': [],
        'bottom-center': [],
        'bottom-right': [],
    }

    toasts.value.forEach(toast => {
        const pos = toast.position || props.position
        grouped[pos].push(toast)
    })

    return grouped
})
</script>

<template>
    <ToastProvider>
        <!-- Render a viewport for each position that has toasts -->
        <template v-for="position in positions" :key="position">
            <template v-if="toastsByPosition[position].length > 0">
                <Toast v-for="toast in toastsByPosition[position]" :key="toast.id" :severity="toast.severity"
                    :duration="toast.duration ?? undefined" :showProgress="toast.showProgress"
                    :closable="toast.closable" :icon="toast.icon" :pauseOnHover="toast.pauseOnHover"
                    :createdAt="toast.createdAt" :open="toast.open" @update:open="toast.onOpenChange">
                    <template #content>
                        <ToastTitle v-if="toast.title">
                            {{ toast.title }}
                        </ToastTitle>
                        <ToastDescription v-if="toast.description">
                            {{ toast.description }}
                        </ToastDescription>
                    </template>
                    <template v-if="toast.action" #action>
                        <component :is="toast.action" />
                    </template>
                </Toast>
                <ToastViewport :position="position" />
            </template>
        </template>
    </ToastProvider>
</template>
