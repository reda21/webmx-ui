<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, inject, type HTMLAttributes, type ComputedRef } from 'vue'
import { cn } from '../../../lib/utils'
import { Icon } from '@iconify/vue'

type AutoCompleteSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface AutoCompleteProps {
    modelValue?: string | object
    suggestions?: (string | object)[]
    field?: string
    minLength?: number
    delay?: number
    placeholder?: string
    disabled?: boolean
    loading?: boolean
    dropdown?: boolean
    forceSelection?: boolean
    emptyMessage?: string
    size?: AutoCompleteSize
    class?: HTMLAttributes['class']
    name?: string
}

const props = withDefaults(defineProps<AutoCompleteProps>(), {
    field: 'label',
    minLength: 1,
    delay: 300,
    placeholder: '',
    disabled: false,
    loading: false,
    dropdown: false,
    forceSelection: false,
    emptyMessage: 'No results found',
    size: 'md'
})

const emit = defineEmits<{
    'update:modelValue': [value: string | object | null]
    'complete': [query: string]
    'select': [value: string | object]
    'clear': []
}>()

// Form integration
const hasFieldError = inject<ComputedRef<boolean>>('hasFieldError', computed(() => false))
const validateOn = inject<string | undefined>('validateOn', undefined)
const validateField = inject<() => void>('validateField', () => { })
const fieldName = inject<string | undefined>('fieldName', undefined)
const fieldPlaceholder = inject<string | undefined>('fieldPlaceholder', undefined)
const formContext = inject<any>('formContext', null)

// State
const inputValue = ref('')
const isOpen = ref(false)
const activeIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLDivElement | null>(null)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Computed
const effectivePlaceholder = computed(() => props.placeholder || fieldPlaceholder || '')
const inputName = computed(() => props.name || fieldName)

const effectiveModelValue = computed(() => {
    if (props.modelValue !== undefined) {
        return props.modelValue
    }
    if (formContext && fieldName) {
        return formContext.values.value[fieldName]
    }
    return ''
})

const displayValue = computed(() => {
    const val = effectiveModelValue.value
    if (!val) return ''
    if (typeof val === 'string') return val
    return (val as any)[props.field] || ''
})

const filteredSuggestions = computed(() => {
    return props.suggestions || []
})

const hasError = computed(() => hasFieldError.value)

// Size classes
const sizeClasses = computed(() => {
    const sizes = {
        xs: 'h-7 px-2 py-1 text-xs',
        sm: 'h-8 px-2.5 py-1.5 text-sm',
        md: 'h-10 px-3 py-2 text-sm',
        lg: 'h-12 px-4 py-3 text-base',
        xl: 'h-14 px-5 py-3.5 text-lg',
        '2xl': 'h-16 px-6 py-4 text-xl'
    }
    return sizes[props.size]
})

const inputClasses = computed(() => {
    return cn(
        'flex w-full rounded-md border border-input bg-background file:border-0 file:bg-transparent file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all',
        'disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-70',
        sizeClasses.value,
        hasError.value && 'border-destructive text-destructive placeholder:text-destructive/50 focus-visible:ring-destructive',
        (props.loading || props.dropdown) && 'pr-10',
        props.class
    )
})

// Methods
const getItemLabel = (item: string | object): string => {
    if (typeof item === 'string') return item
    return (item as any)[props.field] || ''
}

const updateModelValue = (value: string | object | null) => {
    if (props.modelValue !== undefined) {
        emit('update:modelValue', value)
    } else if (formContext && fieldName) {
        formContext.setFieldValue(fieldName, value)
    }
}

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const query = target.value
    inputValue.value = query

    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }

    if (query.length >= props.minLength) {
        debounceTimer = setTimeout(() => {
            emit('complete', query)
            isOpen.value = true
            activeIndex.value = -1
        }, props.delay)
    } else {
        isOpen.value = false
    }

    // If forceSelection is false, update value on input
    if (!props.forceSelection) {
        updateModelValue(query)
    }
}

const handleSelect = (item: string | object) => {
    const label = getItemLabel(item)
    inputValue.value = label
    updateModelValue(item)
    emit('select', item)
    isOpen.value = false
    activeIndex.value = -1

    // Validate after selection
    if (validateOn === 'change') {
        validateField()
    }
}

const handleClear = () => {
    inputValue.value = ''
    updateModelValue(null)
    emit('clear')
    isOpen.value = false
    inputRef.value?.focus()
}

const handleDropdownClick = () => {
    if (props.disabled) return
    if (isOpen.value) {
        isOpen.value = false
    } else {
        emit('complete', inputValue.value)
        isOpen.value = true
    }
    inputRef.value?.focus()
}

const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen.value && event.key !== 'ArrowDown') return

    switch (event.key) {
        case 'ArrowDown':
            event.preventDefault()
            if (!isOpen.value) {
                emit('complete', inputValue.value)
                isOpen.value = true
            } else {
                activeIndex.value = Math.min(activeIndex.value + 1, filteredSuggestions.value.length - 1)
            }
            break
        case 'ArrowUp':
            event.preventDefault()
            activeIndex.value = Math.max(activeIndex.value - 1, 0)
            break
        case 'Enter':
            event.preventDefault()
            if (activeIndex.value >= 0 && activeIndex.value < filteredSuggestions.value.length) {
                handleSelect(filteredSuggestions.value[activeIndex.value])
            }
            break
        case 'Escape':
            event.preventDefault()
            isOpen.value = false
            activeIndex.value = -1
            break
    }
}

const handleBlur = (event: FocusEvent) => {
    // Delay closing to allow click on suggestions
    setTimeout(() => {
        if (!panelRef.value?.contains(document.activeElement)) {
            isOpen.value = false
            activeIndex.value = -1

            // If forceSelection and no valid selection, clear
            if (props.forceSelection && inputValue.value !== displayValue.value) {
                inputValue.value = displayValue.value
            }

            // Validate on blur
            if (!validateOn || validateOn === 'blur') {
                validateField()
            }
        }
    }, 150)
}

const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node
    if (
        inputRef.value && !inputRef.value.contains(target) &&
        panelRef.value && !panelRef.value.contains(target)
    ) {
        isOpen.value = false
        activeIndex.value = -1
    }
}

// Watchers
watch(displayValue, (newVal) => {
    inputValue.value = newVal
}, { immediate: true })

// Lifecycle
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    if (debounceTimer) {
        clearTimeout(debounceTimer)
    }
})
</script>

<template>
    <div class="relative w-full">
        <!-- Input -->
        <div class="relative">
            <input ref="inputRef" :id="inputName" type="text" :value="inputValue" :placeholder="effectivePlaceholder"
                :disabled="disabled" :name="inputName" :class="inputClasses" role="combobox" :aria-expanded="isOpen"
                aria-haspopup="listbox"
                :aria-activedescendant="activeIndex >= 0 ? `autocomplete-option-${activeIndex}` : undefined"
                autocomplete="off" @input="handleInput" @keydown="handleKeydown" @blur="handleBlur" />

            <!-- Loading Spinner -->
            <div v-if="loading" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon icon="lucide:loader-2" class="h-4 w-4 animate-spin text-muted-foreground" />
            </div>

            <!-- Dropdown Button -->
            <button v-else-if="dropdown" type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabindex="-1" @click="handleDropdownClick">
                <Icon :icon="isOpen ? 'lucide:chevron-up' : 'lucide:chevron-down'" class="h-4 w-4" />
            </button>

            <!-- Clear Button -->
            <button v-else-if="inputValue && !disabled" type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabindex="-1" @click="handleClear">
                <Icon icon="lucide:x" class="h-4 w-4" />
            </button>
        </div>

        <!-- Suggestions Panel -->
        <div v-if="isOpen && filteredSuggestions.length > 0" ref="panelRef"
            class="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-lg max-h-60 overflow-auto"
            role="listbox">
            <div v-for="(item, index) in filteredSuggestions" :key="index" :id="`autocomplete-option-${index}`"
                role="option" :aria-selected="activeIndex === index" :class="cn(
                    'px-3 py-2 cursor-pointer transition-colors',
                    activeIndex === index ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                )" @click="handleSelect(item)" @mouseenter="activeIndex = index">
                {{ getItemLabel(item) }}
            </div>
        </div>

        <!-- Empty Message -->
        <div v-else-if="isOpen && filteredSuggestions.length === 0 && !loading" ref="panelRef"
            class="absolute z-50 w-full mt-1 bg-popover border border-input rounded-md shadow-lg">
            <div class="px-3 py-2 text-muted-foreground text-sm">
                {{ emptyMessage }}
            </div>
        </div>
    </div>
</template>
