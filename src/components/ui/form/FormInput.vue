<script setup lang="ts">
import FormField from './FormField.vue'
import { Input } from '../input'

type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const props = defineProps<{
    // FormField props
    name: string
    validateOn?: 'change' | 'blur' | 'submit'
    label?: string
    required?: boolean
    placeholder?: string
    help?: string

    // Input props
    type?: string
    disabled?: boolean
    lazy?: boolean
    debounce?: number
    highlight?: boolean
    loading?: boolean
    size?: InputSize
}>()
</script>

<template>
    <FormField :name="name" :validateOn="validateOn" :label="label" :required="required" :placeholder="placeholder"
        :help="help" :highlight="highlight">
        <Input :type="type" :disabled="disabled" :lazy="lazy" :debounce="debounce" :loading="loading" :size="size" />
    </FormField>
</template>
