<template>
  <div id="zero-login" :data-url="appUrl"></div>
</template>

<script setup>
const { appUrl } = defineProps({ appUrl: String })
</script>
