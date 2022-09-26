<template>
  <div>
    <el-alert title="Information" type="info" show-icon :closable="false">
      For more informations about adding a domain on Zerologin, please
      <a href="https://docs.zerologin.co/" target="_blank"> read the documentation </a>
    </el-alert>

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
      <el-form-item label="Issue cookies to client" prop="issueCookies">
        <el-switch v-model="ruleForm.issueCookies" />
      </el-form-item>
      <el-form-item label="Token name" prop="tokenName">
        <el-input v-model="ruleForm.tokenName" />
      </el-form-item>
      <el-form-item label="Refresh token name" prop="refreshTokenName">
        <el-input v-model="ruleForm.refreshTokenName" />
      </el-form-item>
      <el-form-item>
        <div style="width: 100%; display: flex; justify-content: flex-end; gap: 10px">
          <Link href="/account" style="text-decoration: none">
            <el-button>Cancel</el-button>
          </Link>
          <el-button type="primary" @click="submitForm(ruleFormRef)">
            {{ props.domain ? 'Update' : 'Create' }}
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { Inertia } from '@inertiajs/inertia'
import { reactive, ref } from 'vue'
import { ElNotification } from 'element-plus'
import { Link } from '@inertiajs/inertia-vue3'

const props = defineProps({ domain: Object })
console.log(props.domain)

const formSize = ref('default')
const ruleFormRef = ref()
const ruleForm = reactive({
  rootUrl: props.domain?.root_url ?? '',
  zerologinUrl: props.domain?.zerologin_url ?? '',
  secret: props.domain?.jwt_secret ?? '',
  issueCookies: props.domain?.issue_cookies ?? true,
  tokenName: props.domain?.token_name ?? 'jwt',
  refreshTokenName: props.domain?.refresh_token_name ?? 'refresh_token',
})

const checkIssueCookies = (rule, value, callback) => {
  if (ruleForm.issueCookies && value === '') {
    callback(new Error('Required if "Issue cookies" is checked'))
  }
  callback()
}

const rules = reactive({
  rootUrl: [{ required: true, message: 'Root URL is required', trigger: 'blur' }],
  zerologinUrl: [{ required: true, message: 'Zerologin URL is required', trigger: 'blur' }],
  secret: [{ required: true, message: 'Secret is required', trigger: 'blur' }],
  tokenName: [{ validator: checkIssueCookies, trigger: 'blur' }],
  refreshTokenName: [{ validator: checkIssueCookies, trigger: 'blur' }],
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      if (props.domain) {
        Inertia.put('/domains/' + props.domain.id, ruleForm, {
          preserveScroll: true,
          onSuccess: () => {
            ElNotification({
              title: 'Success',
              message: `${ruleForm.rootUrl} has been updated`,
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
      } else {
        Inertia.post('/domains', ruleForm, {
          preserveScroll: true,
          onSuccess: () => {
            ElNotification({
              title: 'Success',
              message: `${ruleForm.rootUrl} has been added to your account`,
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
    }
  })
}
</script>
