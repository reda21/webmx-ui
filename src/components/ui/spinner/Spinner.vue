<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { type SpinnerVariants, spinnerVariants } from '.'
import { cn } from '../../../lib/utils'

interface Props {
    size?: SpinnerVariants['size']
    variant?: SpinnerVariants['variant']
    icon?: string
    class?: string
}

const props = withDefaults(defineProps<Props>(), {
    icon: 'lucide:loader-2',
})
</script>

<template>
    <Icon :icon="icon" :class="cn(spinnerVariants({ size, variant }), props.class)" />
</template>
