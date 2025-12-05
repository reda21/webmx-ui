<script setup lang="ts">
import { ref, computed, watch, inject } from 'vue'
import { Icon } from '@iconify/vue'
import Input from '../input/Input.vue'
import { cn } from '../../../lib/utils'

const props = withDefaults(defineProps<{
    modelValue?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean

    // Configuration Props
    visibilityToggle?: boolean
    strengthIndicator?: boolean
    showRequirementList?: boolean

    // Requirement Checks
    checkUppercase?: boolean
    checkLowercase?: boolean
    checkNumber?: boolean
    checkSymbol?: boolean
}>(), {
    visibilityToggle: true,
    strengthIndicator: true,
    showRequirementList: true,
    checkUppercase: true,
    checkLowercase: true,
    checkNumber: true,
    checkSymbol: true,
    placeholder: '********'
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

// Inject FormField context to get error state
const hasFieldError = inject('hasFieldError', computed(() => false))

const isVisible = ref(false)
const internalValue = ref(props.modelValue || '')

watch(() => props.modelValue, (newVal) => {
    internalValue.value = newVal || ''
})

const toggleVisibility = () => {
    isVisible.value = !isVisible.value
}

// Dynamic Requirement Generation
const effectiveRequirements = computed(() => {
    const rules = [
        { label: 'At least 8 characters', regex: /.{8,}/, active: true } // Always basic min length? Or configurable? 
        // Keeping min length as base requirement for 'strength' usually. 
        // User asked for specific checks, assuming length is implicit or handled by validation rules?
        // Let's keep length as a base metric for the visual list if it's shown.
    ]

    if (props.checkUppercase) rules.push({ label: 'At least one uppercase letter', regex: /[A-Z]/, active: true })
    if (props.checkLowercase) rules.push({ label: 'At least one lowercase letter', regex: /[a-z]/, active: true })
    if (props.checkNumber) rules.push({ label: 'At least one number', regex: /\d/, active: true })
    if (props.checkSymbol) rules.push({ label: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/, active: true })

    return rules.filter(r => r.active)
})

const metRequirements = computed(() => {
    return effectiveRequirements.value.map(req => ({
        ...req,
        met: req.regex.test(internalValue.value)
    }))
})

// Strength Calculation
const strength = computed(() => {
    if (!internalValue.value) return 0
    // Include length in strength calcs or just requirements?
    // Let's add a basic length check for strength scoring even if not listed
    let score = 0
    if (internalValue.value.length >= 8) score += 1

    const metCount = metRequirements.value.filter(req => req.met).length
    // Normalize total
    const totalChecks = effectiveRequirements.value.length + 1 // +1 for length
    return ((score + metCount) / totalChecks) * 100
})

const strengthColor = computed(() => {
    if (strength.value <= 10) return 'bg-destructive' // Very weak
    if (strength.value <= 40) return 'bg-orange-500' // Weak
    if (strength.value <= 70) return 'bg-yellow-500' // Medium
    return 'bg-green-500' // Strong
})

const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    internalValue.value = target.value
    emit('update:modelValue', target.value)
}

</script>

<template>
    <div class="space-y-2">
        <div class="relative">
            <Input :type="isVisible ? 'text' : 'password'" :value="internalValue" @input="handleInput"
                :placeholder="placeholder" :disabled="disabled" :required="required" class="pr-10" />

            <button v-if="visibilityToggle" type="button" @click="toggleVisibility"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabindex="-1">
                <Icon :icon="isVisible ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
            </button>
        </div>

        <!-- Strength Meter -->
        <div v-if="strengthIndicator && internalValue"
            class="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden transition-all duration-300">
            <div class="h-full transition-all duration-300" :class="strengthColor" :style="{ width: `${strength}%` }">
            </div>
        </div>

        <!-- Requirements List -->
        <div v-if="showRequirementList && internalValue" class="mt-2 text-xs space-y-1">
            <!-- Always show length req for clarity? Or purely based on props? -->
            <div class="flex items-center gap-2"
                :class="internalValue.length >= 8 ? 'text-green-600' : 'text-muted-foreground'">
                <Icon :icon="internalValue.length >= 8 ? 'lucide:check' : 'lucide:circle'" class="h-3 w-3" />
                <span>At least 8 characters</span>
            </div>

            <div v-for="(req, index) in metRequirements" :key="index" class="flex items-center gap-2"
                :class="req.met ? 'text-green-600' : 'text-muted-foreground'">
                <Icon :icon="req.met ? 'lucide:check' : 'lucide:circle'" class="h-3 w-3" />
                <span>{{ req.label }}</span>
            </div>
        </div>
    </div>
</template>
