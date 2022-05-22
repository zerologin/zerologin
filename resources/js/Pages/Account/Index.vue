<template>
  <div>
    <div v-for="domain in domains" :key="domain.id">
      {{ domain.name }}
    </div>
  </div>
</template>

<script setup>
const { domains } = defineProps({ domains: Object })
</script>
