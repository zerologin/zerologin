<template>
  <el-container>
    <el-header class="header">
      <Header :auth="auth" />
    </el-header>
    <el-main>
      <slot />
    </el-main>
    <el-footer>zerologin</el-footer>
  </el-container>
</template>

<script setup>
import Header from '../Partials/Header'
const { auth } = defineProps({ auth: Object })
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
}
</style>