<template>
  <AuthGoogle :text="'Đăng nhập'" />
  <div class="!mt-5">
    <Form @submit="handleSubmit" :validation-schema="SignInSchema">
      <AuthInput v-model="formData.email" :placeholder="'Email'" :isRequired="true" name="email" />
      <AuthInput
        v-model="formData.password"
        :placeholder="'Mật khẩu'"
        :type="'password'"
        :isRequired="true"
        name="password"
      />

      <p class="text-sm text-[#5d87ff] mt-[-10px] font-semibold">Quên mật khẩu?</p>

      <div class="mt-5">
        <button
          type="submit"
          class="w-full outline-none bg-[#5d87ff] text-white rounded-lg min-h-[48px] px-7 py-3 font-medium hover:opacity-90"
        >
          Đăng nhập
        </button>
        <div class="text-sm text-black mt-3">
          Chưa có tài khoản?
          <span @click="handleAuth" class="text-[#5d87ff] cursor-pointer ml-1">Đăng ký</span>
        </div>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Form } from 'vee-validate'
import { SignInSchema } from '@/schemas/SignInSchema'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue'

import AuthInput from '@/components/auth/AuthInput.vue'
import AuthGoogle from '@/components/auth/AuthGoogle.vue'

const authStore = useAuthStore()
const toast = useToast()

const formData = reactive({
  email: '',
  password: '',
  username: '',
})

const handleAuth = () => {
  authStore.component = 'register'
}

const handleSubmit = async () => {
  // console.log('Data: ', { ...formData })
  const submitData = { ...formData }
  const response = await authStore.handleLogin(submitData as { email: string; password: string })

  if (response.isSuccess == false) {
    toast.add({
      severity: 'error',
      summary: response.message,
      group: 'tl',
      life: 3000,
    })
  } else {
    toast.add({
      severity: 'success',
      summary: response.message,
      group: 'tl',
      life: 1500,
    })
    window.location.href = '/'
  }
}
</script>
