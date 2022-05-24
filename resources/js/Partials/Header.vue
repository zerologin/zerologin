<template>
  <div>
    <h1><a href="/" style="color: #000">zerologin</a></h1>
  </div>
  <div>
    <div v-if="!auth.isLoggedIn">
      <Link href="/login" style="text-decoration: none">
        <el-button type="primary">Login</el-button>
      </Link>
    </div>
    <div v-if="auth.isLoggedIn">
      <el-dropdown>
        <span class="el-dropdown-link">
          <span class="username">{{ auth.username.slice(0, 9) }}</span>
          <el-icon class="el-icon--right">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <Link href="/account">Account</Link>
            </el-dropdown-item>
            <el-dropdown-item divided>
              <!-- <Link href="/logout">Logout</Link> -->
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { Link } from '@inertiajs/inertia-vue3'
const { auth } = defineProps({ auth: Object })
</script>

<style lang="scss" scoped>
a {
  text-decoration: none;
}
.el-dropdown-link {
  display: flex;
  align-items: center;
  .username {
    font-size: 18px;
    color: #000;
  }
}
</style>
