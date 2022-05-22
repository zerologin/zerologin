<template>
  <div>
    <h1>zerologin</h1>
    <div v-for="domain in domains" :key="domain.id">
      {{ domain.name }}
    </div>
  </div>
</template>

<script setup>
const { domains } = defineProps({ domains: Object })
</script>
