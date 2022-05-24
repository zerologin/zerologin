<template>
  <el-container>
    <el-header class="header">
      <Header :auth="auth" />
    </el-header>
    <el-main>
      <div class="main-container">
        <slot />
      </div>
    </el-main>
    <el-footer class="footer">
      <Footer />
    </el-footer>
  </el-container>
</template>

<script setup>
import Header from '../Partials/Header'
import Footer from '../Partials/Footer'
const { auth } = defineProps({ auth: Object })
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid black;
}
.footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-top: 1px solid black;
  height: auto;
  margin-top: 15px;
  padding: 15px;
  font-size: 15px;
}
</style>
