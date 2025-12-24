<script setup lang="ts">
import { ToastViewport, type ToastViewportProps } from 'radix-vue'
import { computed, type HTMLAttributes } from 'vue'
import { toastViewportVariants } from './toast-variants'
import { cn } from '../../../lib/utils'
import type { ToastPosition } from '../../../composables/useToast'

const props = defineProps<ToastViewportProps & {
    class?: HTMLAttributes['class']
    position?: ToastPosition
}>()

const delegatedProps = computed(() => {
    const { class: _, position: __, ...delegated } = props
    return delegated
})
</script>

<template>
    <ToastViewport v-bind="delegatedProps"
        :class="cn(toastViewportVariants({ position: position ?? 'bottom-right' }), props.class)" />
</template>
