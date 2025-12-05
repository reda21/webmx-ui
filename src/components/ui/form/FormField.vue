<script setup lang="ts">
// FormField component
import { inject, computed, provide, ref } from 'vue'
import type { UseFormReturn } from '../../../composables/useForm'
import FormLabel from './FormLabel.vue'
import FormMessage from './FormMessage.vue'

const props = defineProps<{
    name: string
    validateOn?: 'change' | 'blur' | 'submit'
    label?: string
    required?: boolean
    placeholder?: string
    help?: string
    highlight?: boolean
}>()

const form = inject<UseFormReturn<any> | null>('formContext', null)

// Gracefully handle missing form context
// IMPORTANT: We must access form.errors.value directly to establish reactivity
const error = computed(() => {
    if (!form) return undefined
    // Access form.errors.value to trigger reactivity when errors change
    const errorsObj = form.errors.value
    const fieldErrors = errorsObj[props.name]
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined
})
const hasError = computed(() => !!error.value)

// Provide error state and validation context to child components
provide('fieldError', error)
provide('hasFieldError', hasError)
provide('validateOn', props.validateOn)
provide('validateField', () => form?.validateField(props.name))
provide('fieldName', props.name)
provide('fieldLabel', props.label)
provide('fieldPlaceholder', props.placeholder)
provide('fieldHelp', props.help)
provide('fieldHighlight', props.highlight)
</script>

<template>
    <div class="flex flex-col gap-2">
        <FormLabel v-if="label" :required="required">{{ label }}</FormLabel>
        <slot :error="error" />
        <p v-if="help && !error" class="text-sm text-muted-foreground">{{ help }}</p>
        <FormMessage />
    </div>
</template>
