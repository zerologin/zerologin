<template>
  <el-container>
    <el-affix>
      <el-header class="header">
        <Header :auth="auth" />
      </el-header>
    </el-affix>
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
  background-image: radial-gradient(transparent 1px, #fff 1px);
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
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
