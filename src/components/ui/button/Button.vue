<script setup lang="ts">
import './button-styles.css'
import { computed, inject, useAttrs } from 'vue'
import type { HTMLAttributes } from 'vue'
import { Primitive, type PrimitiveProps } from 'radix-vue'
import { type ButtonVariants, buttonVariants } from '.'
import { cn } from '../../../lib/utils'
import { Icon } from '@iconify/vue'


export type ElementType = 'button' | 'a' | 'input'

interface Props extends PrimitiveProps {
    variant?: ButtonVariants['variant']
    severity?: ButtonVariants['severity']
    size?: ButtonVariants['size']
    rounded?: ButtonVariants['rounded']
    iconPos?: ButtonVariants['iconPos']
    square?: boolean
    icon?: string
    label?: string
    loading?: boolean
    class?: HTMLAttributes['class']

    // ARIA Props
    ariaExpanded?: boolean
    ariaPressed?: boolean
    ariaDescribedby?: string
    ariaControls?: string
    ariaHaspopup?: boolean | string
    ariaCurrent?: string
    ariaLive?: string
    ariaAtomic?: boolean
    ariaRelevant?: string
    ariaDisabled?: boolean
    ariaHidden?: boolean
    ariaLabelledby?: string

    // Event Props
    onChange?: (event: Event) => void
    onClick?: (event: MouseEvent) => void
    onDblClick?: (event: MouseEvent) => void
    onMouseenter?: (event: MouseEvent) => void
    onMouseleave?: (event: MouseEvent) => void
    onTouchstart?: (event: TouchEvent) => void
    onFocus?: (event: FocusEvent) => void
    onBlur?: (event: FocusEvent) => void
    onAnimationend?: (event: AnimationEvent) => void
    onAnimationstart?: (event: AnimationEvent) => void
    onTransitionend?: (event: TransitionEvent) => void
    onMousedown?: (event: MouseEvent) => void
    onMouseup?: (event: MouseEvent) => void
    onKeydown?: (event: KeyboardEvent) => void
    onKeyup?: (event: KeyboardEvent) => void

    /**
     * The element or component this component should render as when not a link.
     * @defaultValue 'button'
     */
    as?: ElementType
    asChild?: boolean

    /**
     * Icon to display before the label.
     */
    leadingIcon?: string

    /**
     * Icon to display after the label.
     */
    trailingIcon?: string

    /**
     * Whether the button is in an active state.
     */
    active?: boolean

    /**
     * Whether the button has a raised shadow.
     */
    raised?: boolean

    /**
     * Avatar image URL to display on the left side.
     */
    avatar?: string
}

const props = withDefaults(defineProps<Props>(), {
    as: 'button',
})

const attrs = useAttrs()

// Inject form context for auto loading/disabled state
const formContext = inject<any>('formContext', null)

// Auto loading: for submit buttons, use form's isSubmitting state if loading prop is not provided
const effectiveLoading = computed(() => {
    // Check if loading prop was explicitly provided in attrs
    if ('loading' in attrs) {
        return props.loading ?? false
    }
    // For submit buttons, automatically use form's isSubmitting state
    if (attrs.type === 'submit' && formContext?.meta?.value?.isSubmitting) {
        return formContext.meta.value.isSubmitting
    }
    return false
})

// Auto disabled: for reset buttons, use form's isSubmitting state if disabled prop is not provided
const effectiveDisabled = computed(() => {
    // Check if disabled prop was explicitly provided in attrs
    if ('disabled' in attrs) {
        return attrs.disabled as boolean
    }
    // For reset buttons, automatically disable during form submission
    if (attrs.type === 'reset' && formContext?.meta?.value?.isSubmitting) {
        return formContext.meta.value.isSubmitting
    }
    // Loading state also disables the button
    return effectiveLoading.value
})

const forwardedProps = computed(() => {
    const {
        variant, severity, size, rounded, iconPos, square, raised, icon, leadingIcon, trailingIcon, label, loading, active, avatar, class: className, as, asChild,
        ...delegated
    } = props
    return delegated
})
</script>

<template>
    <Primitive :as="as" :as-child="asChild" :disabled="effectiveDisabled" :data-active="active" v-bind="forwardedProps"
        :class="cn(buttonVariants({ variant, severity, size, rounded, iconPos, square, raised }), props.class, { 'opacity-70 pointer-events-none': effectiveLoading })">
        <img v-if="avatar" :src="avatar" alt="Avatar" class="h-5 w-5 rounded-full object-cover" />
        <Icon v-else-if="effectiveLoading" icon="lucide:loader-2" class="h-5 w-5 spinner-icon" />
        <Icon v-else-if="leadingIcon" :icon="leadingIcon" class="h-5 w-5" />

        <slot>
            <Icon v-if="!effectiveLoading && !leadingIcon && !avatar && icon" :icon="icon" class="h-5 w-5" />
            <span v-if="label">{{ label }}</span>
        </slot>

        <Icon v-if="trailingIcon" :icon="trailingIcon" class="h-5 w-5" />
    </Primitive>
</template>

<style scoped>
.spinner-icon {
    animation: button-spin 1s linear infinite;
}

@keyframes button-spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}
</style>
