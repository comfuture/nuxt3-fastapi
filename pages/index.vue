<template>
  <div>{{ data?.message }}</div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const { data } = await $api('/')
</script>
