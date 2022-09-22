<template>
  <div>
    <zerologin-auth :url="appUrl" @success="success" @error="error"></zerologin-auth>
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
