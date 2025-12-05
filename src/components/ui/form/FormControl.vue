<script setup lang="ts">
import { Slot } from 'radix-vue'
import { inject, computed } from 'vue'

const fieldName = inject<string | undefined>('fieldName', undefined)
const hasFieldError = inject<boolean | undefined>('hasFieldError', undefined)
</script>

<template>
    <Slot :id="fieldName" :aria-invalid="hasFieldError"
        :aria-describedby="hasFieldError ? `${fieldName}-error` : undefined">
        <slot />
    </Slot>
</template>
