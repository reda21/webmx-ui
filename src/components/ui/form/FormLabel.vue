<script setup lang="ts">
import { inject, type HTMLAttributes } from 'vue'
import { cn } from '../../../lib/utils'

const props = defineProps<{
    class?: HTMLAttributes['class']
    required?: boolean
}>()

const fieldName = inject<string | undefined>('fieldName', undefined)
const fieldLabel = inject<string | undefined>('fieldLabel', undefined)
const hasFieldError = inject<boolean | undefined>('hasFieldError', undefined)
</script>

<template>
    <label :for="fieldName" :class="cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        hasFieldError ? 'text-destructive' : '',
        props.class
    )">
        <slot>{{ fieldLabel }}</slot>
        <span v-if="required" class="text-destructive ml-1">*</span>
    </label>
</template>
