<template>
  <div>
    <zero-login :zlurl="appUrl" @success="success" @error="error"></zero-login>
  </div>
</template>

<script setup>
import { ElNotification } from 'element-plus'

const { appUrl } = defineProps({ appUrl: String })

const success = (s) => {
  location.href = "/account";
}

const error = (err) => {
  ElNotification({
    title: 'Error',
    message: 'An error occured',
    type: 'error',
    duration: 5000,
  })
}
</script>
