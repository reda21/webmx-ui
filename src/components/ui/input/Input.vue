<script setup lang="ts">
import { ref, computed, inject, watch, onUnmounted, useAttrs, type HTMLAttributes, type ComputedRef } from 'vue'
import { cn } from '../../../lib/utils'
import { Icon } from '@iconify/vue'

type InputSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const props = defineProps<{
    type?: string
    modelValue?: string | number
    class?: HTMLAttributes['class']
    disabled?: boolean
    placeholder?: string
    required?: boolean
    name?: string // Nom du champ pour les formulaires
    label?: string // Label du champ
    description?: string // Description du champ
    lazy?: boolean // Met à jour seulement au blur
    debounce?: number // Délai en ms avant la mise à jour (ex: 300)
    highlight?: boolean // Active l'animation de highlight lors d'une erreur
    loading?: boolean // Affiche un loader et désactive l'input
    help?: string // Texte d'aide affiché sous l'input
    error?: string | boolean // Message d'erreur ou état d'erreur
    hint?: string // Indice/suggestion affiché sous l'input
    size?: InputSize // Taille de l'input
    eagerValidation?: boolean // Validation immédiate au lieu d'attendre le blur
    validateOnInputDelay?: number // Délai avant validation sur input (défaut: 300ms)
}>()

const emit = defineEmits<{
    'update:modelValue': [value: string | number]
    input: [event: Event]
    blur: [event: FocusEvent]
}>()

const attrs = useAttrs()

// Inject error state and validation context from FormField
const hasFieldError = inject<ComputedRef<boolean>>('hasFieldError', computed(() => false))
const validateOn = inject<string | undefined>('validateOn', undefined)
const validateField = inject<() => void>('validateField', () => { })
const fieldName = inject<string | undefined>('fieldName', undefined)
const fieldLabel = inject<string | undefined>('fieldLabel', undefined)
const fieldPlaceholder = inject<string | undefined>('fieldPlaceholder', undefined)
const fieldHelp = inject<string | undefined>('fieldHelp', undefined)
const fieldHighlight = inject<boolean | undefined>('fieldHighlight', undefined)

// Inject form context for auto v-model binding
const formContext = inject<any>('formContext', null)

// Use injected name and placeholder if props are not provided
const inputName = computed(() => props.name || fieldName)
// Only show label if directly provided via prop AND not inside FormField (which has its own label)
const inputLabel = computed(() => fieldLabel ? null : props.label)
const inputPlaceholder = computed(() => props.placeholder || fieldPlaceholder)
const inputHelp = computed(() => props.help || fieldHelp)

// Check if we're inside a FormField context
const isInsideFormField = computed(() => !!fieldName)

// Combine prop and injected highlight
const effectiveHighlight = computed(() => props.highlight || fieldHighlight || false)

// Auto loading: use form's isSubmitting state if loading prop is not provided
const effectiveLoading = computed(() => {
    // Check if loading prop was explicitly provided in attrs
    if ('loading' in attrs) {
        return props.loading ?? false
    }
    // Otherwise, use form's isSubmitting state if available
    return formContext?.meta?.value?.isSubmitting ?? false
})

// Auto v-model: use form field value if modelValue prop is not provided
const effectiveModelValue = computed(() => {
    if (props.modelValue !== undefined) {
        return props.modelValue
    }
    if (formContext && fieldName) {
        return formContext.values.value[fieldName]
    }
    return ''
})

// Highlight state pour l'animation
const isHighlighted = ref(false)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

const triggerHighlight = () => {
    isHighlighted.value = true

    // Réinitialiser après l'animation
    if (highlightTimer) {
        clearTimeout(highlightTimer)
    }
    highlightTimer = setTimeout(() => {
        isHighlighted.value = false
    }, 600) // Durée de l'animation
}

// Trigger highlight animation when error occurs (if highlight prop is enabled)
watch(() => hasFieldError.value, (newValue) => {
    if (newValue && effectiveHighlight.value) {
        triggerHighlight()
    }
})

// Also trigger if highlight prop changes to true (manual trigger)
watch(() => effectiveHighlight.value, (newValue) => {
    if (newValue) {
        triggerHighlight()
    }
})

// Valeur interne pour le mode lazy ou debounce
const internalValue = ref<string | number>(effectiveModelValue.value || '')
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let validationTimer: ReturnType<typeof setTimeout> | null = null

// Synchroniser la valeur interne avec effectiveModelValue
watch(effectiveModelValue, (newValue) => {
    internalValue.value = newValue || ''
})

// Nettoyer les timers au démontage
onUnmounted(() => {
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
    if (highlightTimer) {
        clearTimeout(highlightTimer)
    }
    if (validationTimer) {
        clearTimeout(validationTimer)
    }
})

const updateModelValue = (value: string | number) => {
    // If explicit v-model is used, emit update
    if (props.modelValue !== undefined) {
        emit('update:modelValue', value)
    }
    // If auto-binding, update form field directly
    else if (formContext && fieldName) {
        formContext.setFieldValue(fieldName, value)
    }

    // Validation on change (from FormField validateOn prop)
    if (validateOn === 'change') {
        validateField()
    }
    // Eager validation with delay
    else if (props.eagerValidation) {
        if (validationTimer) {
            clearTimeout(validationTimer)
        }
        const delay = props.validateOnInputDelay ?? 300
        validationTimer = setTimeout(() => {
            validateField()
        }, delay)
    }
}

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = target.value

    internalValue.value = value
    emit('input', event)

    // Mode lazy: ne pas mettre à jour immédiatement
    if (props.lazy) {
        return
    }

    // Mode debounce: attendre avant de mettre à jour
    if (props.debounce) {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(() => {
            updateModelValue(value)
        }, props.debounce)
        return
    }

    // Mode normal: mise à jour immédiate
    updateModelValue(value)
}

const handleBlur = (event: FocusEvent) => {
    // En mode lazy ou debounce, mettre à jour au blur
    if (props.lazy || props.debounce) {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }
        updateModelValue(internalValue.value)
    }

    emit('blur', event)

    // Validate on blur by default (if not configured for 'change' or 'submit')
    if (!validateOn || validateOn === 'blur') {
        validateField()
    }
}

const inputClasses = computed(() => {
    // Size variants
    const sizeClasses = {
        xs: 'h-7 px-2 py-1 text-xs',
        sm: 'h-8 px-2.5 py-1.5 text-sm',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
        xl: 'h-14 px-5 py-3.5 text-lg',
        '2xl': 'h-16 px-6 py-4 text-xl'
    }

    const currentSize = props.size || 'md'

    return cn(
        'flex w-full rounded-md border border-input bg-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all',
        // Disabled state: gray background, reduced opacity, not-allowed cursor
        'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70',
        sizeClasses[currentSize],
        // Error/Invalid state: red border and text color, keep ring on focus
        hasError.value && 'border-destructive text-destructive placeholder:text-destructive/50 focus-visible:ring-destructive',
        isHighlighted.value && 'animate-shake',
        effectiveLoading.value && 'pr-10',
        props.class
    )
})

// Check if there's a custom error or field error
const hasError = computed(() => props.error || hasFieldError.value)

watch(() => hasError.value, (val) => {
    console.log('[Input] hasError changed:', val, 'fieldName:', fieldName)
})

// Remove inputStyles as we use classes now
const inputStyles = computed(() => ({}))

// Compute effective error message
const effectiveError = computed(() => {
    if (typeof props.error === 'string') {
        return props.error
    }
    return null
})

// Utiliser la valeur interne en mode lazy/debounce, sinon effectiveModelValue
const displayValue = computed(() => {
    return (props.lazy || props.debounce) ? internalValue.value : effectiveModelValue.value
})
</script>

<template>
    <div class="w-full flex flex-col gap-1.5">
        <!-- Label Slot -->
        <slot name="label" :label="inputLabel">
            <label v-if="inputLabel"
                class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                :for="inputName">
                {{ inputLabel }} <span v-if="required" class="text-destructive">*</span>
            </label>
        </slot>

        <!-- Description Slot -->
        <slot name="description" :description="description">
            <p v-if="description" class="text-sm text-muted-foreground">
                {{ description }}
            </p>
        </slot>

        <div class="relative">
            <!-- Default Slot (Input wrapper) -->
            <slot :error="effectiveError">
                <input :id="inputName" :type="type || 'text'" :value="displayValue"
                    :disabled="disabled || effectiveLoading" :placeholder="inputPlaceholder" :required="required"
                    :name="inputName" :class="inputClasses" @input="handleInput" @blur="handleBlur" />
            </slot>

            <div v-if="effectiveLoading" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon icon="lucide:loader-2" class="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        </div>

        <!-- Error Slot (only when NOT inside FormField) -->
        <slot v-if="!isInsideFormField" name="error" :error="effectiveError">
            <p v-if="effectiveError" class="text-sm font-medium text-destructive">
                {{ effectiveError }}
            </p>
        </slot>

        <!-- Help Slot (only when NOT inside FormField) -->
        <slot v-if="!isInsideFormField" name="help" :help="inputHelp">
            <p v-if="inputHelp && !effectiveError" class="text-sm text-muted-foreground">
                {{ inputHelp }}
            </p>
        </slot>

        <!-- Hint Slot (only when NOT inside FormField) -->
        <slot v-if="!isInsideFormField" name="hint" :hint="hint">
            <p v-if="hint && !effectiveError && !inputHelp" class="text-sm text-muted-foreground italic">
                {{ hint }}
            </p>
        </slot>
    </div>
</template>
