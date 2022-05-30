<template>
  <div>
    <Link href="/domains/create" style="text-decoration: none">
      <el-button type="primary">Add domain</el-button>
    </Link>

    <h1>Your domains</h1>
    <el-table :data="domains" stripe>
      <el-table-column prop="root_url" label="Root" />
      <el-table-column prop="zerologin_url" label="Zerologin" />
      <el-table-column prop="created_at" label="Created at">
        <template #default="scope">
          {{ DateTime.fromISO(scope.row.created_at).toLocaleString(DateTime.DATE_SHORT) }}
        </template>
      </el-table-column>
      <el-table-column label="Operations" align="right">
        <template #default="scope">
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteDomain(scope.row.id, scope.row.root_url)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { Inertia } from '@inertiajs/inertia'
import { reactive, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { DateTime } from 'luxon'
import { Link } from '@inertiajs/inertia-vue3'

const { domains } = defineProps({ domains: Array })

const handleDeleteDomain = (id, rootUrl) => {
  Inertia.delete(`/domains/${id}`, {
    preserveScroll: true,
    onSuccess: () => {
      ElNotification({
        title: 'Success',
        message: `${rootUrl} has been deleted`,
        type: 'success',
        duration: 5000,
      })
    },
    onError(err) {
      console.error(err)
      for (const key of Object.keys(err)) {
        ElNotification({
          title: 'Error',
          message: err[key][0],
          type: 'error',
          duration: 5000,
        })
      }
    },
  })
}
</script>
