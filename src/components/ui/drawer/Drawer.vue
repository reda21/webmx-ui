<script lang="ts" setup>
import { DrawerRoot } from 'vaul-vue'
import { useForwardPropsEmits } from 'radix-vue'

const props = defineProps<{
  activeSnapPoint?: number | string | null
  closeThreshold?: number
  defaultOpen?: boolean
  modal?: boolean
  nested?: boolean
  open?: boolean
  preventScrollRestoration?: boolean
  shouldScaleBackground?: boolean
  snapPoints?: (number | string)[]
  direction?: 'top' | 'bottom' | 'left' | 'right'
  dismissible?: boolean
  handleOnly?: boolean
  setBackgroundColorOnScale?: boolean
}>()

const emits = defineEmits<{
  'update:open': [payload: boolean]
  'update:activeSnapPoint': [payload: number | string | null]
}>()

const forwarded = useForwardPropsEmits(props, emits)
</script>

<template>
  <DrawerRoot v-bind="forwarded">
    <slot />
  </DrawerRoot>
</template>
