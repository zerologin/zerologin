<template>
  <div>
    <h1>Add domain</h1>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      :size="formSize"
      label-position="top"
    >
      <el-form-item label="Root domain: yourdomain.com" prop="domain">
        <el-input v-model="ruleForm.domain" />
      </el-form-item>
      <el-form-item label="Secret: will be used for JWT encryption" prop="secret">
        <el-input type="password" v-model="ruleForm.secret" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(ruleFormRef)">Create</el-button>
      </el-form-item>
    </el-form>

    <h1>Your domains</h1>
    <el-table :data="domains" stripe>
      <el-table-column prop="name" label="Domain" />
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
            @click="handleDeleteDomain(scope.row.id, scope.row.name)"
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

const { domains } = defineProps({ domains: Array })

const formSize = ref('default')
const ruleFormRef = ref()
const ruleForm = reactive({
  domain: '',
  secret: '',
})

const rules = reactive({
  domain: [{ required: true, message: 'Root domain name is required', trigger: 'blur' }],
  secret: [{ required: true, message: 'Secret is required', trigger: 'blur' }],
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      Inertia.post('/domains', ruleForm, {
        preserveScroll: true,
        onSuccess: () => {
          ElNotification({
            title: 'Success',
            message: `${ruleForm.domain} has been added to your account`,
            type: 'success',
            duration: 5000,
          })
          resetForm(formEl)
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
  })
}

const handleDeleteDomain = (id, domain) => {
  Inertia.delete(`/domains/${id}`, {
    preserveScroll: true,
    onSuccess: () => {
      ElNotification({
        title: 'Success',
        message: `${domain} has been deleted`,
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

const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>