<template>
  <div>
    <el-alert title="Information" type="info" show-icon :closable="false">
      For more informations about adding a domain on Zerologin, please
      <a href="https://docs.zerologin.co/" target="_blank"> read the documentation </a>
    </el-alert>

    <h1>Add Sigauth domain</h1>
    <el-form
      ref="ruleFormRef"
      :model="ruleForm"
      :rules="rules"
      :size="formSize"
      label-position="top"
    >
      <el-form-item label="Zerologin URL: login.yourdomain.com" prop="zerologinUrl">
        <el-input v-model="ruleForm.zerologinUrl" />
      </el-form-item>
      <el-form-item label="Redirect URL: yourdomain.com/success" prop="redirectUrl">
        <el-input v-model="ruleForm.redirectUrl" />
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

      <h2>Transports</h2>
      <div style="width: 100%; display: flex; gap: 10px">
        <el-form-item label="Webrtc" prop="transportWebrtc">
          <el-switch v-model="ruleForm.transportWebrtc" />
        </el-form-item>
        <el-form-item label="Redirect" prop="transportRedirect">
          <el-switch v-model="ruleForm.transportRedirect" />
        </el-form-item>
        <el-form-item label="Polling" prop="transportPolling">
          <el-switch v-model="ruleForm.transportPolling" />
        </el-form-item>
      </div>

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

const formSize = ref('default')
const ruleFormRef = ref()
const ruleForm = reactive({
  zerologinUrl: props.domain?.zerologin_url ?? '',
  redirectUrl: props.domain?.redirect_url ?? '',
  secret: props.domain?.jwt_secret ?? '',
  issueCookies: props.domain?.issue_cookies ?? true,
  tokenName: props.domain?.token_name ?? 'jwt',
  transportWebrtc: props.domain?.transport_webrtc ?? true,
  transportRedirect: props.domain?.transport_redirect ?? true,
  transportPolling: props.domain?.transport_polling ?? false,
})

const checkIssueCookies = (rule, value, callback) => {
  if (ruleForm.issueCookies && value === '') {
    callback(new Error('Required if "Issue cookies" is checked'))
  }
  callback()
}

const rules = reactive({
  zerologinUrl: [{ required: true, message: 'Zerologin URL is required', trigger: 'blur' }],
  secret: [{ required: true, message: 'Secret is required', trigger: 'blur' }],
  tokenName: [{ validator: checkIssueCookies, trigger: 'blur' }],
})

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      if (props.domain) {
        Inertia.put('/sigauth-domains/' + props.domain.id, ruleForm, {
          preserveScroll: true,
          onSuccess: () => {
            ElNotification({
              title: 'Success',
              message: `${ruleForm.zerologinUrl} has been updated`,
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
        Inertia.post('/sigauth-domains', ruleForm, {
          preserveScroll: true,
          onSuccess: () => {
            ElNotification({
              title: 'Success',
              message: `${ruleForm.zerologinUrl} has been added to your account`,
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
