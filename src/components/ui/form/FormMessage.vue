<script setup lang="ts">
import { inject, computed, type HTMLAttributes, type ComputedRef } from 'vue'
import { cn } from '../../../lib/utils'

const props = defineProps<{
    class?: HTMLAttributes['class']
    error?: string
}>()

const fieldError = inject<ComputedRef<string | undefined>>('fieldError', computed(() => undefined))

const message = computed(() => props.error || fieldError.value)
</script>

<template>
    <p v-if="message" :class="cn('text-sm font-medium', props.class)"
        style="color: hsl(var(--destructive, 0 84% 60%));">
        {{ message }}
    </p>
</template>
