<script setup lang="ts">
// FormField component
import { inject, computed, provide } from 'vue'
import type { UseFormReturn, FieldMeta } from '../../../composables/useForm'
import FormLabel from './FormLabel.vue'
import FormMessage from './FormMessage.vue'

const props = withDefaults(defineProps<{
    name: string
    as?: string
    rules?: any
    validateOnMount?: boolean
    validateOnInput?: boolean
    validateOnChange?: boolean
    validateOnBlur?: boolean
    validateOnModelUpdate?: boolean
    bails?: boolean
    label?: string
    value?: any
    type?: string
    uncheckedValue?: any
    standalone?: boolean
    keepValue?: boolean
    // Deprecated/Legacy props
    validateOn?: 'change' | 'blur' | 'submit'
    required?: boolean
    placeholder?: string
    help?: string
    highlight?: boolean
}>(), {
    as: 'div',
    validateOnMount: false,
    validateOnInput: false,
    validateOnChange: true,
    validateOnBlur: true,
    validateOnModelUpdate: true,
    bails: true,
    standalone: false
})

const form = inject<UseFormReturn<any> | null>('formContext', null)

// Register field with form if not standalone and form exists
if (form && !props.standalone) {
    let registerStrategy: 'change' | 'blur' | 'submit' = 'blur'
    if (props.validateOnChange || props.validateOnInput) registerStrategy = 'change'

    form.register(props.name, {
        rules: props.rules,
        validateOn: registerStrategy
    })
}

const error = computed(() => {
    if (!form || props.standalone) return undefined
    const errorsObj = form.errors.value
    const fieldErrors = errorsObj[props.name]
    return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined
})
const hasError = computed(() => !!error.value)

const fieldMeta = computed<FieldMeta>(() => {
    if (form && !props.standalone) {
        return form.getFieldMeta(props.name)
    }
    return {
        touched: false,
        dirty: false,
        valid: true,
        validated: false,
        pending: false,
        initialValue: undefined
    }
})

// Provide context
provide('fieldError', error)
provide('hasFieldError', hasError)

// Determine effective validation strategy for child components (Input.vue)
const effectiveValidateOn = computed(() => {
    if (props.validateOn) return props.validateOn
    if (props.validateOnChange || props.validateOnInput) return 'change'
    if (props.validateOnBlur) return 'blur'
    return 'submit'
})

provide('validateOnInput', props.validateOnInput)
provide('validateOnChange', props.validateOnChange)
provide('validateOnBlur', props.validateOnBlur)
provide('validateOnModelUpdate', props.validateOnModelUpdate)
provide('fieldBails', props.bails)
provide('validateOn', effectiveValidateOn)

// Update rules dynamically if they change
// This handles cases where rules are reactive or replaced
import { watch } from 'vue'
if (form && !props.standalone) {
    watch(() => props.rules, (newRules) => {
        form.register(props.name, {
            rules: newRules,
            validateOn: effectiveValidateOn.value
        })
    }, { deep: true })
}

provide('validateField', () => {
    if (form && !props.standalone) {
        return form.validateField(props.name, undefined, props.bails)
    }
})
provide('fieldName', props.name)
provide('fieldLabel', props.label)
provide('fieldPlaceholder', props.placeholder)
provide('fieldHelp', props.help)
provide('fieldHighlight', props.highlight)
</script>

<template>
    <component :is="as" class="flex flex-col gap-2">
        <FormLabel v-if="label" :required="required">{{ label }}</FormLabel>
        <slot :error="error" :meta="fieldMeta" />
        <p v-if="help && !error" class="text-sm text-muted-foreground">{{ help }}</p>
        <FormMessage />
    </component>
</template>
