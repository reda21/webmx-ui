<script setup lang="ts">
import FormField from './FormField.vue'
import { Input } from '../input'

type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const props = withDefaults(defineProps<{
    // FormField props
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
    uncheckedValue?: any
    standalone?: boolean
    keepValue?: boolean
    validateOn?: 'change' | 'blur' | 'submit'
    required?: boolean
    placeholder?: string
    help?: string
    highlight?: boolean

    // Input props
    type?: string
    disabled?: boolean
    lazy?: boolean
    debounce?: number
    loading?: boolean
    size?: InputSize
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
</script>

<template>
    <FormField :name="name" :as="as" :rules="rules" :validateOnMount="validateOnMount"
        :validateOnInput="validateOnInput" :validateOnChange="validateOnChange" :validateOnBlur="validateOnBlur"
        :validateOnModelUpdate="validateOnModelUpdate" :bails="bails" :label="label" :value="value"
        :uncheckedValue="uncheckedValue" :standalone="standalone" :keepValue="keepValue" :validateOn="validateOn"
        :required="required" :placeholder="placeholder" :help="help" :highlight="highlight">
        <Input :type="type" :disabled="disabled" :lazy="lazy" :debounce="debounce" :loading="loading" :size="size" />
    </FormField>
</template>
