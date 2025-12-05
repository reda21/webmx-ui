<script setup lang="ts">
import { cn } from '../../../lib/utils'
import { cardVariants, type CardVariants } from '.'

interface Props {
    severity?: CardVariants['severity']
    class?: string
}

const props = defineProps<Props>()
</script>

<template>
    <div :class="cn(cardVariants({ severity }), props.class)">
        <slot />
    </div>
</template>
