<script lang="ts" setup>
import { DrawerClose } from 'vaul-vue'
import type { DrawerCloseProps } from 'vaul-vue'

const props = defineProps<DrawerCloseProps>()
</script>

<template>
  <DrawerClose v-bind="props">
    <slot />
  </DrawerClose>
</template>
