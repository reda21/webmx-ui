<script setup lang="ts">
import { provide, computed, toRefs } from 'vue'
import { useForm, type UseFormReturn, type ValidationRule } from '../../../composables/useForm'
import type { ZodSchema } from 'zod'
import type { AnyObjectSchema } from 'yup'

const props = withDefaults(defineProps<{
    as?: string
    validationSchema?: ZodSchema | AnyObjectSchema | Record<string, ValidationRule[]>
    initialValues?: Record<string, any>
    initialErrors?: Record<string, string>
    initialTouched?: Record<string, boolean>
    validateOnMount?: boolean
    keepValues?: boolean
    name?: string
    form?: UseFormReturn<any> // Optional: allow passing existing form instance
    onSubmit?: (values: Record<string, any>, ctx: any) => void | Promise<void>
}>(), {
    as: 'form',
    initialValues: () => ({}),
    initialErrors: () => ({}),
    initialTouched: () => ({}),
    validateOnMount: false,
    keepValues: false,
    name: 'Form'
})

const emit = defineEmits<{
    submit: [values: Record<string, any>, ctx: any]
}>()

// Initialize form internally if not provided
const internalForm = !props.form ? useForm({
    initialValues: props.initialValues,
    initialErrors: props.initialErrors,
    initialTouched: props.initialTouched,
    validationSchema: props.validationSchema,
    validateOnMount: props.validateOnMount,
    onSubmit: async (values, ctx) => {
        if (props.onSubmit) {
            await props.onSubmit(values, ctx)
        } else {
            emit('submit', values, ctx)
        }
    }
}) : null

// Use provided form or internal form
const form = props.form || internalForm!

// Provide form context to child components
provide('formContext', form)

// Compute simple errors object (Record<string, string>) for the slot
const simpleErrors = computed(() => {
    const result: Record<string, string> = {}
    Object.entries(form.errors.value).forEach(([key, val]) => {
        if (val && val.length > 0) {
            result[key] = val[0]
        }
    })
    return result
})

// Slot props
const slotProps = computed(() => ({
    errors: simpleErrors.value,
    errorBag: form.errors.value,
    values: form.values.value,
    meta: form.meta.value,
    isSubmitting: form.isSubmitting.value,
    isValidating: form.isValidating.value,
    submitCount: form.submitCount.value,

    setFieldError: form.setFieldError,
    setErrors: form.setErrors,
    setFieldValue: form.setFieldValue,
    setValues: form.setValues,
    setFieldTouched: form.setFieldTouched,
    setTouched: form.setTouched,

    validate: form.validate,
    validateField: form.validateField,
    handleSubmit: form.handleSubmit,
    submitForm: form.submitForm,
    handleReset: form.handleReset,
    resetForm: form.resetForm
}))

// Create submit handler
const onSubmit = (e: Event) => {
    if (props.as === 'form') {
        form.submitForm(e)
    }
}
</script>

<template>
    <component :is="as" @submit="onSubmit" @reset="form.handleReset" novalidate>
        <slot v-bind="slotProps" />
    </component>
</template>
