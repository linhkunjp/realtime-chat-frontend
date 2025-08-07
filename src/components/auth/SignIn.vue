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
import { useSignIn } from '@clerk/vue'
import { useUser } from '@clerk/vue'

import AuthInput from '@/components/auth/AuthInput.vue'
import AuthGoogle from '@/components/auth/AuthGoogle.vue'
import { useAuth } from '@clerk/vue'

const authStore = useAuthStore()
const toast = useToast()
const { signIn, setActive } = useSignIn()
const { user } = useUser()
const { getToken } = useAuth()

const formData = reactive({
  email: '',
  password: '',
  username: '',
})

const handleAuth = () => {
  authStore.component = 'register'
}

const handleSubmit = async () => {
  if (authStore.isLoading == true) {
    return
  }
  // const submitData = { ...formData }
  // console.log('submitData: ', submitData)
  authStore.isLoading = true
  try {
    const results = await signIn.value?.create({
      identifier: formData.email,
      password: formData.password,
    })
    authStore.isLoading = false
    if (results && results.status == 'complete') {
      await setActive.value?.({ session: results.createdSessionId })
      const token = await getToken.value()
      localStorage.setItem('user_id', user.value?.id ?? '')
      localStorage.setItem('email', user.value?.emailAddresses[0]?.emailAddress ?? '')
      localStorage.setItem('username', user.value?.username ?? '')
      localStorage.setItem('image', user.value?.imageUrl ?? '')
      localStorage.setItem('token', token ?? '')

      toast.add({
        severity: 'success',
        summary: 'Đăng nhập thành công',
        group: 'tl',
        life: 3000,
      })

      setTimeout(() => {
        window.location.href = '/'
      }, 200)
    }
  } catch (error) {
    if (error instanceof Error) {
      authStore.isLoading = false
      const customError = (error as any).errors[0]
      const code = customError.code
      let message = ''
      if (code && code == 'form_identifier_not_found') {
        message = 'Tài khoản không tồn tại'
      } else if (code && code == 'form_password_incorrect') {
        message = 'Mật khẩu không đúng'
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
