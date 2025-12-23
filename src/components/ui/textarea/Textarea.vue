<script setup lang="ts">
import { computed, inject, ref, watch, onUnmounted, type HTMLAttributes, type ComputedRef } from 'vue'
import { cn } from '../../../lib/utils'

const props = defineProps<{
    modelValue?: string
    class?: HTMLAttributes['class']
    disabled?: boolean
    placeholder?: string
    required?: boolean
    rows?: number
    name?: string
    lazy?: boolean
    debounce?: number
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string]
    input: [event: Event]
    blur: [event: FocusEvent]
}>()

// Inject contexts from FormField
const hasFieldError = inject<ComputedRef<boolean>>('hasFieldError', computed(() => false))
const validateOn = inject<string | undefined>('validateOn', undefined)
const validateField = inject<() => void>('validateField', () => { })
const fieldName = inject<string | undefined>('fieldName', undefined)
const fieldPlaceholder = inject<string | undefined>('fieldPlaceholder', undefined)

// Inject form context for auto v-model binding
const formContext = inject<any>('formContext', null)

const inputName = computed(() => props.name || fieldName)
const inputPlaceholder = computed(() => props.placeholder || fieldPlaceholder)

// Auto v-model: use form field value if modelValue prop is not provided
const effectiveModelValue = computed(() => {
    if (props.modelValue !== undefined) {
        return props.modelValue
    }
    if (formContext && fieldName) {
        return formContext.values.value[fieldName]
    }
    return ''
})

const internalValue = ref<string>(effectiveModelValue.value || '')
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(effectiveModelValue, (newValue) => {
    internalValue.value = newValue || ''
})

onUnmounted(() => {
    if (debounceTimer) clearTimeout(debounceTimer)
})

const updateModelValue = (value: string) => {
    console.log(`[Textarea] updateModelValue for ${fieldName}:`, value)
    if (props.modelValue !== undefined) {
        emit('update:modelValue', value)
    } else if (formContext && fieldName) {
        formContext.setFieldValue(fieldName, value)
    }

    if (validateOn === 'change') {
        validateField()
    }
}

const handleInput = (event: Event) => {
    const target = event.target as HTMLTextAreaElement
    const value = target.value
    internalValue.value = value
    emit('input', event)

    if (props.lazy) return

    if (props.debounce) {
        if (debounceTimer) clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            updateModelValue(value)
        }, props.debounce)
        return
    }

    updateModelValue(value)
}

const handleBlur = (event: FocusEvent) => {
    if (props.lazy || props.debounce) {
        updateModelValue(internalValue.value)
    }
    emit('blur', event)
    if (!validateOn || validateOn === 'blur') {
        validateField()
    }
}

const textareaClasses = computed(() => cn(
    'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
    hasFieldError.value
        ? 'border-destructive focus-visible:ring-destructive'
        : 'border-input focus-visible:ring-ring',
    props.class
))

const displayValue = computed(() => {
    return (props.lazy || props.debounce) ? internalValue.value : effectiveModelValue.value
})
</script>

<template>
    <textarea :id="inputName" :value="displayValue" :disabled="disabled" :placeholder="inputPlaceholder"
        :required="required" :rows="rows || 3" :class="textareaClasses" @input="handleInput" @blur="handleBlur" />
</template>
