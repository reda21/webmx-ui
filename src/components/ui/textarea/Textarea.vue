<script setup lang="ts">
import { computed, inject, type HTMLAttributes, type ComputedRef } from 'vue'
import { cn } from '../../../lib/utils'

const props = defineProps<{
    modelValue?: string
    class?: HTMLAttributes['class']
    disabled?: boolean
    placeholder?: string
    required?: boolean
    rows?: number
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    input: [event: Event]
    blur: [event: FocusEvent]
}>()

// Inject error state from FormField (if available)
const hasFieldError = inject<ComputedRef<boolean>>('hasFieldError', computed(() => false))

const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    emit('update:modelValue', target.value)
    emit('input', event)
}

const handleBlur = (event: FocusEvent) => {
    emit('blur', event)
}

const textareaClasses = computed(() => cn(
    'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
    hasFieldError.value
        ? 'border-destructive focus-visible:ring-destructive'
        : 'border-input focus-visible:ring-ring',
    props.class
))
</script>

<template>
    <textarea :value="modelValue" :disabled="disabled" :placeholder="placeholder" :required="required" :rows="rows || 3"
        :class="textareaClasses" @input="handleInput" @blur="handleBlur" />
</template>
