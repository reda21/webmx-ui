<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { cn } from '@/lib/utils'

type SupportedLocale = 'fr' | 'en' | 'ar' | 'es' | 'de'

const LOCALE_CONFIG: Record<SupportedLocale, { dir: 'ltr' | 'rtl' }> = {
    fr: { dir: 'ltr' },
    en: { dir: 'ltr' },
    ar: { dir: 'rtl' },
    es: { dir: 'ltr' },
    de: { dir: 'ltr' },
}

interface DatePickerProps {
    modelValue?: string | Date
    placeholder?: string
    min?: string
    max?: string
    disabled?: boolean
    class?: string
    locale?: SupportedLocale
}

const props = withDefaults(defineProps<DatePickerProps>(), {
    placeholder: 'Sélectionner une date',
    locale: 'fr',
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'blur': []
}>()

const hasFieldError = inject<ComputedRef<boolean>>('hasFieldError', computed(() => false))

const localeConfig = computed(() => LOCALE_CONFIG[props.locale] || LOCALE_CONFIG.fr)

const parseDate = (value?: string | Date): Date | undefined => {
    if (!value) return undefined
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value
    if (typeof value !== 'string' || value.trim() === '') return undefined
    const parts = value.split('-').map(Number)
    if (parts.length !== 3 || parts.some(isNaN)) return undefined
    const [year, month, day] = parts
    return new Date(year, month - 1, day)
}

const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

const dateValue = computed({
    get: () => parseDate(props.modelValue),
    set: (value: Date | Date[] | null | undefined) => {
        if (value instanceof Date) {
            emit('update:modelValue', formatDateToISO(value))
        } else if (Array.isArray(value) && value[0] instanceof Date) {
            emit('update:modelValue', formatDateToISO(value[0]))
        } else {
            emit('update:modelValue', '')
        }
    }
})

const minDate = computed(() => parseDate(props.min))
const maxDate = computed(() => parseDate(props.max))

const handleBlur = () => emit('blur')

const inputClasses = computed(() => cn(
    'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'cursor-pointer transition-colors',
    hasFieldError.value
        ? 'border-destructive focus-visible:ring-destructive'
        : 'border-input focus-visible:ring-ring',
    props.class
))

const containerClasses = computed(() => cn(
    'relative',
    localeConfig.value.dir === 'rtl' && 'rtl'
))

// Format display based on locale
const formatDisplay = computed(() => {
    switch (props.locale) {
        case 'en':
            return 'MM/dd/yyyy'
        case 'ar':
            return 'dd MMMM yyyy'
        default:
            return 'dd/MM/yyyy'
    }
})
</script>

<template>
    <div :class="containerClasses">
        <VueDatePicker v-model="dateValue" :format="formatDisplay" :min-date="minDate" :max-date="maxDate"
            :disabled="disabled" :placeholder="placeholder" :enable-time-picker="false" auto-apply
            :text-input="{ enterSubmit: true, tabSubmit: true }" @blur="handleBlur">
            <template #dp-input="{ value, onInput, onEnter, onTab, onBlur, onKeypress, onPaste }">
                <input :value="value" :placeholder="placeholder" :disabled="disabled" :class="inputClasses"
                    :dir="localeConfig.dir" readonly @input="onInput" @keydown.enter="onEnter" @keydown.tab="onTab"
                    @blur="onBlur" @keypress="onKeypress" @paste="onPaste" />
            </template>
        </VueDatePicker>
    </div>
</template>

<style>
/* Custom styles for vue-datepicker to match shadcn theme */
:root {
    --dp-font-family: inherit;
    --dp-border-radius: 0.5rem;
    --dp-cell-border-radius: 0.375rem;
    --dp-font-size: 0.875rem;
    --dp-preview-font-size: 0.875rem;
    --dp-time-font-size: 0.875rem;
}

/* Light theme */
.dp__theme_light {
    --dp-background-color: hsl(var(--background));
    --dp-text-color: hsl(var(--foreground));
    --dp-hover-color: hsl(var(--accent));
    --dp-hover-text-color: hsl(var(--accent-foreground));
    --dp-hover-icon-color: hsl(var(--muted-foreground));
    --dp-primary-color: hsl(var(--primary));
    --dp-primary-text-color: hsl(var(--primary-foreground));
    --dp-secondary-color: hsl(var(--secondary));
    --dp-border-color: hsl(var(--border));
    --dp-menu-border-color: hsl(var(--border));
    --dp-border-color-hover: hsl(var(--ring));
    --dp-disabled-color: hsl(var(--muted));
    --dp-disabled-color-text: hsl(var(--muted-foreground));
    --dp-scroll-bar-background: hsl(var(--muted));
    --dp-scroll-bar-color: hsl(var(--muted-foreground));
    --dp-success-color: hsl(var(--primary));
    --dp-success-color-disabled: hsl(var(--muted));
    --dp-icon-color: hsl(var(--muted-foreground));
    --dp-danger-color: hsl(var(--destructive));
    --dp-highlight-color: hsla(var(--primary), 0.1);
}

/* Dark theme */
.dp__theme_dark {
    --dp-background-color: hsl(var(--background));
    --dp-text-color: hsl(var(--foreground));
    --dp-hover-color: hsl(var(--accent));
    --dp-hover-text-color: hsl(var(--accent-foreground));
    --dp-hover-icon-color: hsl(var(--muted-foreground));
    --dp-primary-color: hsl(var(--primary));
    --dp-primary-text-color: hsl(var(--primary-foreground));
    --dp-secondary-color: hsl(var(--secondary));
    --dp-border-color: hsl(var(--border));
    --dp-menu-border-color: hsl(var(--border));
    --dp-border-color-hover: hsl(var(--ring));
    --dp-disabled-color: hsl(var(--muted));
    --dp-disabled-color-text: hsl(var(--muted-foreground));
    --dp-scroll-bar-background: hsl(var(--muted));
    --dp-scroll-bar-color: hsl(var(--muted-foreground));
    --dp-success-color: hsl(var(--primary));
    --dp-success-color-disabled: hsl(var(--muted));
    --dp-icon-color: hsl(var(--muted-foreground));
    --dp-danger-color: hsl(var(--destructive));
    --dp-highlight-color: hsla(var(--primary), 0.1);
}

/* RTL support */
.rtl .dp__main {
    direction: rtl;
}
</style>
