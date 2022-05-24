<template>
  <div>
    <h1>⚠️ Before adding a domain on Zerologin</h1>
    <p>
      Considering you own the domain "mydomain.com", you must chose a subdomain (login.mydomain.com
      for example) and add a CNAME in your DNS
    </p>
    <pre>login CNAME zerologin.co.</pre>
    <p>From LNURL-Auth specs</p>
    <em>
      You should carefully choose which subdomain will be used as LNURL-auth endpoint and stick to
      chosen subdomain in future. For example, if auth.site.com was initially chosen then changing
      it to, say, login.site.com will result in a different account for each user because the full
      domain name is used by wallets as material for key derivation.
    </em>

    <h1>Add domain</h1>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      :size="formSize"
      label-position="top"
    >
      <el-form-item label="Root URL: yourdomain.com" prop="rootUrl">
        <el-input v-model="ruleForm.rootUrl" />
      </el-form-item>
      <el-form-item label="Zerologin URL: login.yourdomain.com" prop="zerologinUrl">
        <el-input v-model="ruleForm.zerologinUrl" />
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
            @click="handleDeleteDomain(scope.row.id, scope.row.rootUrl)"
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
  rootUrl: '',
  zerologinUrl: '',
  secret: '',
})

const rules = reactive({
  rootUrl: [{ required: true, message: 'Root URL is required', trigger: 'blur' }],
  zerologinUrl: [{ required: true, message: 'Zerologin URL is required', trigger: 'blur' }],
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
