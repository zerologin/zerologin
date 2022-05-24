<template>
  <div>
    <zero-login :zlurl="appUrl"></zero-login>
  </div>
</template>

<script setup>
const { appUrl } = defineProps({ appUrl: String })
</script>
