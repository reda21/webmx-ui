<script setup lang="ts">
defineProps<{
  msg?: string
}>()
</script>

<template>
  <div class="border-2 border-blue-500 p-4 rounded-lg bg-blue-100 text-blue-900">
    <h3 class="font-bold text-lg mb-2">Web UI Demo Component</h3>
    <p class="mb-2">{{ msg || 'Hello from web-ui!' }}</p>
    <p>Lorem ipsum dolor sit amet. Green Background with Tailwind two</p>
  </div>
</template>
