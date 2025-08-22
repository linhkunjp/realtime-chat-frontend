<template>
  <AuthGoogle :text="'Đăng ký'" />
  <div class="!mt-5">
    <Form @submit="handleSubmit" :validation-schema="SignUpSchema">
      <AuthInput
        v-model="formData.username"
        :placeholder="'Tên'"
        name="userName"
        :isRequired="true"
      />
      <AuthInput v-model="formData.email" :placeholder="'Email'" name="email" :isRequired="true" />
      <AuthInput
        v-model="formData.password"
        :placeholder="'Mật khẩu'"
        :isRequired="true"
        name="password"
      />

      <div class="mt-5">
        <button
          type="submit"
          class="w-full outline-none bg-[#5d87ff] text-white rounded-lg min-h-[48px] px-7 py-3 font-medium hover:opacity-90"
        >
          Đăng ký
        </button>
        <div class="text-sm text-black mt-3">
          Đã có tài khoản?
          <span @click="handleAuth" class="text-[#5d87ff] cursor-pointer ml-1">Đăng nhập</span>
        </div>
      </div>
    </Form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { Form } from 'vee-validate'
import { SignUpSchema } from '@/schemas/SignUpSchema'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue'
import { useSignUp, useUser, useAuth } from '@clerk/vue'
import type { ClerkError } from '@/types/clerk'

import AuthInput from '@/components/auth/AuthInput.vue'
import AuthGoogle from '@/components/auth/AuthGoogle.vue'

const authStore = useAuthStore()
const toast = useToast()
const { signUp, setActive } = useSignUp()
const { user } = useUser()
const { getToken } = useAuth()

const formData = reactive({
  username: '',
  email: '',
  password: '',
})

const handleAuth = () => {
  authStore.component = 'login'
}

const handleSubmit = async () => {
  if (authStore.isLoading == true) {
    return
  }

  authStore.isLoading = true
  try {
    const results = await signUp.value?.create({
      username: formData.username,
      emailAddress: formData.email,
      password: formData.password,
    })
    if (results && results.status == 'complete') {
      await setActive.value?.({ session: results.createdSessionId })
      const token = await getToken.value()
      const userData = {
        userId: user.value?.id ?? '',
        email: user.value?.emailAddresses[0]?.emailAddress ?? '',
        username: user.value?.username ?? '',
        image: user.value?.imageUrl ?? '',
      }
      const response = await authStore.handleAuth(userData, token ?? '')
      if (response && response.isSuccess == false) {
        toast.add({
          severity: 'error',
          summary: response.message,
          group: 'tl',
          life: 3000,
        })
      } else {
        localStorage.setItem('token', token ?? '')
        toast.add({
          severity: 'success',
          summary: 'Tạo tài khoản thành công',
          group: 'tl',
          life: 3000,
        })

        setTimeout(() => {
          window.location.href = '/'
        }, 200)
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      authStore.isLoading = false
      const customError = (error as ClerkError).errors?.[0]
      const code = customError.code
      const meta = customError.meta?.paramName
      let message = ''
      if (code && code == 'form_password_pwned') {
        message =
          'Mật khẩu đã bị lộ trong một vụ rò rỉ dữ liệu trực tuyến. Để bảo mật tài khoản, vui lòng sử dụng mật khẩu khác.'
      } else if (code && code == 'form_identifier_exists') {
        if (meta && meta == 'email_address') {
          message = 'Email đã được sử dụng, vui lòng chọn email khác'
        } else if (meta && meta == 'username') {
          message = 'Tên người dùng đã được sử dụng, vui lòng chọn tên khác'
        }
      }
      toast.add({
        severity: 'error',
        summary: message,
        group: 'tl',
        life: 3000,
      })
    }
  }
}
</script>
