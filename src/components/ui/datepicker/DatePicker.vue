<script setup lang="ts">
import { ref, computed, inject, type ComputedRef } from 'vue'
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import { cn } from '@/lib/utils'
import 'v-calendar/style.css'

interface DatePickerProps {
    modelValue?: string
    placeholder?: string
    min?: string
    max?: string
    disabled?: boolean
    class?: string
}

const props = withDefaults(defineProps<DatePickerProps>(), {
    placeholder: 'Sélectionner une date',
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'blur': []
}>()

// Inject error state from FormField (if available)
const hasFieldError = inject<ComputedRef<boolean>>('hasFieldError', computed(() => false))

// Helper to parse "YYYY-MM-DD" string into a Local Date object (at 00:00:00)
// This avoids timezone issues with new Date("YYYY-MM-DD") defaulting to UTC
const parseDate = (dateStr?: string): Date | undefined => {
    if (!dateStr) return undefined
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)
}

// Convert string date to Date object for v-calendar
const dateValue = computed({
    get: () => {
        return parseDate(props.modelValue) ?? null
    },
    set: (value: Date | null) => {
        if (value) {
            // Convert Date to YYYY-MM-DD string format
            const year = value.getFullYear()
            const month = String(value.getMonth() + 1).padStart(2, '0')
            const day = String(value.getDate()).padStart(2, '0')
            emit('update:modelValue', `${year}-${month}-${day}`)
        } else {
            emit('update:modelValue', '')
        }
    }
})

// Convert min/max strings to Date objects
const minDate = computed(() => parseDate(props.min))
const maxDate = computed(() => parseDate(props.max))

// Format for display (DD/MM/YYYY)
const displayValue = computed(() => {
    if (!props.modelValue) return props.placeholder

    try {
        const date = new Date(props.modelValue)
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    } catch {
        return props.placeholder
    }
})

const isOpen = ref(false)

const handleBlur = () => {
    emit('blur')
}

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
</script>

<template>
    <div class="relative">
        <VCalendarDatePicker v-model="dateValue" :min-date="minDate" :max-date="maxDate" :disabled="disabled"
            :popover="{ visibility: 'click' }" @blur="handleBlur">
            <template #default="{ inputValue, inputEvents }">
                <input :value="displayValue" v-on="inputEvents" :disabled="disabled" :class="inputClasses" readonly />
            </template>
        </VCalendarDatePicker>
    </div>
</template>

<style>
/* Personnalisation du calendrier pour correspondre au thème */
.vc-container {
    --vc-bg: hsl(var(--background));
    --vc-border: hsl(var(--border));
    --vc-focus-ring: hsl(var(--ring));
    --vc-accent-50: hsl(var(--primary) / 0.1);
    --vc-accent-100: hsl(var(--primary) / 0.2);
    --vc-accent-200: hsl(var(--primary) / 0.3);
    --vc-accent-300: hsl(var(--primary) / 0.4);
    --vc-accent-400: hsl(var(--primary) / 0.5);
    --vc-accent-500: hsl(var(--primary) / 0.6);
    --vc-accent-600: hsl(var(--primary) / 0.7);
    --vc-accent-700: hsl(var(--primary) / 0.8);
    --vc-accent-800: hsl(var(--primary) / 0.9);
    --vc-accent-900: hsl(var(--primary));

    border-radius: 0.5rem;
    border: 1px solid hsl(var(--border));
    background: hsl(var(--popover));
    color: hsl(var(--popover-foreground));
    font-family: inherit;
}

.vc-popover-content-wrapper {
    z-index: 50;
}

.vc-header {
    padding: 0.75rem;
}

.vc-weeks {
    padding: 0.5rem;
}

.vc-weekday {
    color: hsl(var(--muted-foreground));
    font-size: 0.875rem;
    font-weight: 500;
}

.vc-day {
    font-size: 0.875rem;
}

.vc-day-content {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
}

.vc-day-content:hover {
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
}

.vc-day-content:focus {
    outline: none;
    box-shadow: 0 0 0 2px hsl(var(--ring));
}

.vc-highlight {
    background: hsl(var(--primary)) !important;
    color: hsl(var(--primary-foreground)) !important;
}

.vc-day.is-today .vc-day-content {
    border: 1px solid hsl(var(--primary));
}

.vc-arrows-container {
    padding: 0.5rem;
}

.vc-arrow {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    transition: all 0.2s;
}

.vc-arrow:hover {
    background: hsl(var(--accent));
}

.vc-title {
    font-weight: 600;
    color: hsl(var(--foreground));
}
</style>
