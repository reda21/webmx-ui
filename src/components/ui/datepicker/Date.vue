<script setup lang="ts">
import { computed, inject, type ComputedRef, useAttrs } from 'vue'
import DatePicker from 'primevue/datepicker'
import { cn } from '@/lib/utils'

type SupportedLocale = 'fr' | 'en' | 'ar' | 'es' | 'de'

const LOCALE_CONFIG: Record<SupportedLocale, { dir: 'ltr' | 'rtl' }> = {
    fr: { dir: 'ltr' },
    en: { dir: 'ltr' },
    ar: { dir: 'rtl' },
    es: { dir: 'ltr' },
    de: { dir: 'ltr' },
}

// Default formats based on locale (PrimeVue format tokens)
const LOCALE_DISPLAY_FORMAT: Record<SupportedLocale, string> = {
    fr: 'dd/mm/yy',
    en: 'mm/dd/yy',
    ar: 'dd/mm/yy',
    es: 'dd/mm/yy',
    de: 'dd.mm.yy',
}

interface DateProps {
    modelValue?: string | Date
    placeholder?: string
    min?: string | Date
    max?: string | Date
    disabled?: boolean
    class?: string
    locale?: SupportedLocale
    /** Format for displaying the date in the input (PrimeVue format, e.g., 'dd/mm/yy'). Defaults based on locale. */
    displayFormat?: string
    /** Format for the model value output (e.g., 'dd/MM/yyyy' or 'yyyy-MM-dd'). Defaults to 'dd/MM/yyyy'. */
    modelFormat?: string
    name?: string
    validateOn?: string
}

const props = withDefaults(defineProps<DateProps>(), {
    placeholder: 'Sélectionner une date',
    locale: 'fr',
    modelFormat: 'dd/MM/yyyy',
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'blur': []
}>()

// Inject form context
const formContext = inject<any>('formContext', null)
const fieldName = inject<string | undefined>('fieldName', undefined)
const validateField = inject<() => void>('validateField', () => { })
const injectedValidateOn = inject<string | undefined>('validateOn', undefined)
const hasFieldError = inject<ComputedRef<boolean>>('hasFieldError', computed(() => false))

const localeConfig = computed(() => LOCALE_CONFIG[props.locale] || LOCALE_CONFIG.fr)

/**
 * Formats a Date object to a string based on a given format pattern.
 * Supported tokens: dd, MM, yyyy
 */
const formatDateToPattern = (date: Date, pattern: string): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return pattern
        .replace('yyyy', String(year))
        .replace('yy', String(year).slice(-2))
        .replace('MM', month)
        .replace('mm', month)
        .replace('dd', day)
}

/**
 * Parses a date string based on a given format pattern.
 * Returns undefined if parsing fails.
 */
const parseDateFromPattern = (value: string, pattern: string): Date | undefined => {
    if (!value || typeof value !== 'string' || value.trim() === '') return undefined

    // Normalize pattern for comparison
    const normalizedPattern = pattern.toLowerCase().replace('yyyy', 'yy')

    // Extract positions of tokens in the pattern
    const yearIndex = normalizedPattern.indexOf('yy')
    const monthIndex = normalizedPattern.indexOf('mm')
    const dayIndex = normalizedPattern.indexOf('dd')

    // Determine the separator (first non-letter character in pattern)
    const separatorMatch = pattern.match(/[^a-zA-Z]/)
    const separator = separatorMatch ? separatorMatch[0] : '/'

    const parts = value.split(separator)
    if (parts.length !== 3) return undefined

    // Map pattern positions to part indices
    const positions = [
        { token: 'yy', index: yearIndex },
        { token: 'mm', index: monthIndex },
        { token: 'dd', index: dayIndex },
    ].sort((a, b) => a.index - b.index)

    let year: number | undefined
    let month: number | undefined
    let day: number | undefined

    positions.forEach((pos, i) => {
        const val = parseInt(parts[i], 10)
        if (isNaN(val)) return
        if (pos.token === 'yy') {
            // Handle 2-digit vs 4-digit years
            year = val < 100 ? 2000 + val : val
        }
        else if (pos.token === 'mm') month = val
        else if (pos.token === 'dd') day = val
    })

    if (year === undefined || month === undefined || day === undefined) return undefined
    if (month < 1 || month > 12 || day < 1 || day > 31) return undefined

    return new Date(year, month - 1, day)
}

/**
 * Parses modelValue which can be in various formats
 */
const parseDate = (value?: string | Date): Date | undefined => {
    if (!value) return undefined
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value
    if (typeof value !== 'string' || value.trim() === '') return undefined

    // Try parsing with the modelFormat first
    let parsed = parseDateFromPattern(value, props.modelFormat)
    if (parsed && !isNaN(parsed.getTime())) return parsed

    // Fallback: try ISO format (yyyy-MM-dd)
    const isoParts = value.split('-').map(Number)
    if (isoParts.length === 3 && !isoParts.some(isNaN)) {
        const [year, month, day] = isoParts
        return new Date(year, month - 1, day)
    }

    return undefined
}

// Effective model value (prop or form context)
const effectiveModelValue = computed(() => {
    if (props.modelValue !== undefined) {
        return props.modelValue
    }
    if (formContext && fieldName) {
        return formContext.values.value[fieldName]
    }
    return undefined
})

const updateModelValue = (value: string) => {
    // If explicit v-model is used, emit update
    if (props.modelValue !== undefined) {
        emit('update:modelValue', value)
    }
    // If auto-binding, update form field directly
    else if (formContext && fieldName) {
        formContext.setFieldValue(fieldName, value)
    }

    // Validation
    const currentValidateOn = props.validateOn || injectedValidateOn
    if (currentValidateOn === 'change' || currentValidateOn === 'input') {
        validateField()
    }
}

const dateValue = computed({
    get: () => parseDate(effectiveModelValue.value) ?? null,
    set: (value: Date | null) => {
        if (value instanceof Date && !isNaN(value.getTime())) {
            updateModelValue(formatDateToPattern(value, props.modelFormat))
        } else {
            updateModelValue('')
        }
    }
})

const minDate = computed(() => parseDate(props.min))
const maxDate = computed(() => parseDate(props.max))

const handleBlur = () => {
    emit('blur')
    const currentValidateOn = props.validateOn || injectedValidateOn
    if (!currentValidateOn || currentValidateOn === 'blur') {
        validateField()
    }
}

// PrimeVue date format
const dateFormat = computed(() => {
    return props.displayFormat || LOCALE_DISPLAY_FORMAT[props.locale] || 'dd/mm/yy'
})

const inputClasses = computed(() => cn(
    'w-full',
    localeConfig.value.dir === 'rtl' && 'rtl',
    props.class
))

const inputStyleClass = computed(() => cn(
    'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'cursor-pointer transition-colors',
    hasFieldError.value
        ? 'border-destructive focus-visible:ring-destructive'
        : 'border-input focus-visible:ring-ring'
))
</script>

<template>
    <DatePicker v-model="dateValue" :date-format="dateFormat" :min-date="minDate" :max-date="maxDate"
        :disabled="disabled" :placeholder="placeholder" show-icon icon-display="input" fluid :class="inputClasses"
        :panel-class="'datepicker-panel'" append-to="body" :pt="{
            root: { dir: localeConfig.dir },
            pcInput: { root: { class: inputStyleClass } }
        }" @blur="handleBlur" />
</template>



<style>
/* PrimeVue 4.x DatePicker styles to match shadcn theme */

/* Input element styling */
.p-datepicker input {
    display: flex;
    height: 2.5rem;
    /* h-10 */
    width: 100%;
    border-radius: var(--radius, 0.5rem);
    /* rounded-md */
    border: 1px solid hsl(var(--input));
    background-color: hsl(var(--background));
    padding: 0.5rem 0.75rem;
    /* px-3 py-2 */
    font-size: 0.875rem;
    /* text-sm */
    color: hsl(var(--foreground));
    transition: colors 0.2s;
}

.p-datepicker input.border-destructive {
    border-color: hsl(var(--destructive));
}

.p-datepicker input.focus-visible\:ring-destructive:focus-visible {
    box-shadow: 0 0 0 2px hsl(var(--destructive)), 0 0 0 4px hsl(var(--background));
    border-color: hsl(var(--destructive));
}

.p-datepicker input::placeholder {
    color: hsl(var(--muted-foreground));
    opacity: 1;
}

.p-datepicker input:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px hsl(var(--ring)), 0 0 0 4px hsl(var(--background));
    border-color: hsl(var(--ring));
}

.p-datepicker input:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

/* Panel container - appended to body */
.datepicker-panel,
.p-datepicker-panel {
    background: hsl(var(--background)) !important;
    border: 1px solid hsl(var(--border)) !important;
    border-radius: 0.5rem !important;
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
    padding: 0.75rem !important;
    z-index: 9999 !important;
}

/* Header with month/year navigation */
.p-datepicker-header {
    background: transparent !important;
    border-bottom: 1px solid hsl(var(--border)) !important;
    padding-bottom: 0.5rem !important;
    margin-bottom: 0.5rem !important;
}

/* Month/Year title */
.p-datepicker-title {
    display: flex !important;
    gap: 0.25rem !important;
}

.p-datepicker-title button,
.p-datepicker-select-month,
.p-datepicker-select-year {
    color: hsl(var(--foreground)) !important;
    font-weight: 600 !important;
    background: transparent !important;
    border: none !important;
    padding: 0.25rem 0.5rem !important;
    border-radius: 0.375rem !important;
    cursor: pointer !important;
}

.p-datepicker-title button:hover,
.p-datepicker-select-month:hover,
.p-datepicker-select-year:hover {
    background: hsl(var(--accent)) !important;
    color: hsl(var(--accent-foreground)) !important;
}

/* Navigation arrows */
.p-datepicker-prev,
.p-datepicker-next,
.p-datepicker-prev-button,
.p-datepicker-next-button {
    color: hsl(var(--muted-foreground)) !important;
    background: transparent !important;
    border: none !important;
    width: 2rem !important;
    height: 2rem !important;
    border-radius: 0.375rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
}

.p-datepicker-prev:hover,
.p-datepicker-next:hover,
.p-datepicker-prev-button:hover,
.p-datepicker-next-button:hover {
    background: hsl(var(--accent)) !important;
    color: hsl(var(--accent-foreground)) !important;
}

/* Day headers (Mon, Tue, etc.) */
.p-datepicker-weekday,
.p-datepicker-calendar th {
    color: hsl(var(--muted-foreground)) !important;
    font-size: 0.75rem !important;
    font-weight: 500 !important;
    padding: 0.5rem !important;
}

/* Calendar grid */
.p-datepicker-calendar {
    border-collapse: separate !important;
    border-spacing: 0.125rem !important;
}

/* Day cells */
.p-datepicker-day,
.p-datepicker-calendar td>span {
    width: 2rem !important;
    height: 2rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border-radius: 0.375rem !important;
    color: hsl(var(--foreground)) !important;
    font-size: 0.875rem !important;
    cursor: pointer !important;
    background: transparent !important;
    border: none !important;
}

.p-datepicker-day:hover,
.p-datepicker-calendar td>span:hover {
    background: hsl(var(--accent)) !important;
    color: hsl(var(--accent-foreground)) !important;
}

/* Today's date */
.p-datepicker-today .p-datepicker-day,
.p-datepicker-calendar td.p-datepicker-today>span {
    background: hsl(var(--secondary)) !important;
    color: hsl(var(--secondary-foreground)) !important;
    font-weight: 600 !important;
}

/* Selected date */
.p-datepicker-day-selected,
.p-datepicker-day.p-highlight,
.p-datepicker-calendar td>span.p-highlight {
    background: hsl(var(--primary)) !important;
    color: hsl(var(--primary-foreground)) !important;
    font-weight: 600 !important;
}

/* Disabled dates */
.p-datepicker-day.p-disabled,
.p-datepicker-calendar td>span.p-disabled {
    color: hsl(var(--muted-foreground)) !important;
    opacity: 0.4 !important;
    cursor: not-allowed !important;
}

/* Other month days */
.p-datepicker-day.p-datepicker-other-month,
.p-datepicker-calendar td.p-datepicker-other-month>span {
    color: hsl(var(--muted-foreground)) !important;
    opacity: 0.5 !important;
}

/* Input icon button */
.p-datepicker-input-icon-container,
.p-datepicker-dropdown {
    color: hsl(var(--muted-foreground)) !important;
    background: transparent !important;
    border: none !important;
    cursor: pointer !important;
}

.p-datepicker-input-icon-container:hover,
.p-datepicker-dropdown:hover {
    color: hsl(var(--foreground)) !important;
}

/* RTL support */
.rtl .p-datepicker {
    direction: rtl !important;
}
</style>
