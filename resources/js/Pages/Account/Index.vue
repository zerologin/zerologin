<template>
  <div>
    <h1>Your domains</h1>

    <div style="display: flex; align-items: center; gap: 10px">
      <h1>Sigauth</h1>
      <Link href="/sigauth-domains/create" style="text-decoration: none">
        <el-button size="small" type="primary">Create</el-button>
      </Link>
    </div>

    <el-table :data="sigauthDomains" stripe>
      <el-table-column prop="zerologin_url" label="Zerologin" />
      <el-table-column label="Transports">
        <template #default="scope">
          <el-tag :type="scope.row.transport_webrtc ? 'success' : 'danger'">WebRTC</el-tag>
          <el-tag :type="scope.row.transport_redirect ? 'success' : 'danger'">Redirect</el-tag>
          <el-tag :type="scope.row.transport_polling ? 'success' : 'danger'">Polling</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="Public ID" />
      <el-table-column prop="created_at" label="Created at">
        <template #default="scope">
          {{ DateTime.fromISO(scope.row.created_at).toLocaleString(DateTime.DATE_SHORT) }}
        </template>
      </el-table-column>
      <el-table-column label="Operations" align="right">
        <template #default="scope">
          <Link
            :href="`/sigauth-domains/${scope.row.id}`"
            style="text-decoration: none; margin-right: 3px"
          >
            <el-button size="small">Edit</el-button>
          </Link>
          <el-button
            size="small"
            type="danger"
            @click="handleDeleteSigauthDomain(scope.row.id, scope.row.zerologin_url)"
          >
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>


    <div style="display: flex; align-items: center; gap: 10px; margin-top: 30px">
      <h1>LNURL</h1>
      <Link href="/domains/create" style="text-decoration: none">
        <el-button size="small" type="primary">Create</el-button>
      </Link>
    </div>

    <el-table :data="domains" stripe>
      <el-table-column prop="root_url" label="Root" />
      <el-table-column prop="zerologin_url" label="Zerologin" />
      <el-table-column prop="public_id" label="Public ID" />
      <el-table-column prop="created_at" label="Created at">
        <template #default="scope">
          {{ DateTime.fromISO(scope.row.created_at).toLocaleString(DateTime.DATE_SHORT) }}
        </template>
      </el-table-column>
      <el-table-column label="Operations" align="right">
        <template #default="scope">
          <Link :href="`/domains/${scope.row.id}`" style="text-decoration: none; margin-right: 3px">
            <el-button size="small">Edit</el-button>
          </Link>
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

const { domains, sigauthDomains } = defineProps({ domains: Array, sigauthDomains: Array })

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

const handleDeleteSigauthDomain = (id, zerologinUrl) => {
  Inertia.delete(`/sigauth-domains/${id}`, {
    preserveScroll: true,
    onSuccess: () => {
      ElNotification({
        title: 'Success',
        message: `${zerologinUrl} has been deleted`,
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
