<script setup lang="ts">
import { ref, computed, watch, useAttrs } from 'vue'
import { Icon } from '@iconify/vue'
import Input from '../input/Input.vue'
import FormField from '../form/FormField.vue'
import { cn } from '../../../lib/utils'

const props = withDefaults(defineProps<{
    modelValue?: string
    name?: string
    label?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    help?: string
    showStrength?: boolean
    showRequirements?: boolean
    requirements?: { label: string; regex: RegExp }[]
    validateOnInput?: boolean
    validateOnChange?: boolean
    validateOnBlur?: boolean
    rules?: any[]
    highlight?: boolean
}>(), {
    showStrength: true,
    showRequirements: true,
    requirements: () => [
        { label: 'At least 8 characters', regex: /.{8,}/ },
        { label: 'At least one number', regex: /\d/ },
        { label: 'At least one lowercase letter', regex: /[a-z]/ },
        { label: 'At least one uppercase letter', regex: /[A-Z]/ },
        { label: 'At least one special character', regex: /[!@#$%^&*(),.?":{}|<>]/ }
    ],
    placeholder: '********',
    validateOnChange: true
})

const emit = defineEmits<{
    'update:modelValue': [value: string]
}>()

const isVisible = ref(false)
const internalValue = ref(props.modelValue || '')

watch(() => props.modelValue, (newVal) => {
    internalValue.value = newVal || ''
})

const toggleVisibility = () => {
    isVisible.value = !isVisible.value
}

// Requirement Checking
const metRequirements = computed(() => {
    return props.requirements.map(req => ({
        ...req,
        met: req.regex.test(internalValue.value)
    }))
})

// Strength Calculation
const strength = computed(() => {
    if (!internalValue.value) return 0
    const metCount = metRequirements.value.filter(req => req.met).length
    return (metCount / props.requirements.length) * 100
})

const strengthColor = computed(() => {
    if (strength.value <= 0) return 'bg-muted'
    if (strength.value <= 25) return 'bg-destructive'
    if (strength.value <= 50) return 'bg-orange-500'
    if (strength.value <= 75) return 'bg-yellow-500'
    return 'bg-green-500'
})

const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement
    internalValue.value = target.value
    emit('update:modelValue', target.value)
}

</script>

<template>
    <div class="space-y-2">
        <FormField :name="name || 'password'" :label="label" :help="help" :required="required" :highlight="highlight"
            :rules="rules" :validateOnInput="validateOnInput" :validateOnChange="validateOnChange"
            :validateOnBlur="validateOnBlur">
            <template #default="{ error }">
                <div class="relative">
                    <Input :type="isVisible ? 'text' : 'password'" :value="internalValue" @input="handleInput"
                        :placeholder="placeholder" :disabled="disabled" :error="!!error" class="pr-10" />
                    <button type="button" @click="toggleVisibility"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none">
                        <Icon :icon="isVisible ? 'lucide:eye-off' : 'lucide:eye'" class="h-4 w-4" />
                    </button>
                </div>

                <!-- Strength Meter -->
                <div v-if="showStrength && internalValue"
                    class="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div class="h-full transition-all duration-300" :class="strengthColor"
                        :style="{ width: `${strength}%` }"></div>
                </div>

                <!-- Requirements List -->
                <div v-if="showRequirements && internalValue" class="mt-2 text-xs space-y-1">
                    <div v-for="(req, index) in metRequirements" :key="index" class="flex items-center gap-2"
                        :class="req.met ? 'text-green-600' : 'text-muted-foreground'">
                        <Icon :icon="req.met ? 'lucide:check' : 'lucide:circle'" class="h-3 w-3" />
                        <span>{{ req.label }}</span>
                    </div>
                </div>
            </template>
        </FormField>
    </div>
</template>
