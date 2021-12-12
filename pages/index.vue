<template>
  <div class="min-h-screen bg-gray-100 p-2">
    <div class="bg-white rounded-md shadow-lg p-4">
      <span class="font-bold">Message from server:</span>
      <span>{{ data?.message }}</span>
    </div>
    <div class="text-center">Running on {{ runMode }}</div>
  </div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const { data } = await $api('/')
const runMode = process.server ? 'server' : 'browser'
</script>
