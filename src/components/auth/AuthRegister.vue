<template>
  <AuthGoogle :text="'Đăng ký'" />
  <div class="!mt-5">
    <Form @submit="handleSubmit" :validation-schema="SignUpSchema">
      <AuthInput
        v-model="formData.username"
        :placeholder="'Họ và tên'"
        name="userName"
        :isRequired="true"
      />
      <div class="flex items-center gap-4 mb-5">
        <div v-for="(item, index) in dataGender" :key="index" class="flex items-center">
          <input
            type="radio"
            v-model="formData.gender"
            :id="item.value"
            :value="item.label"
            class="cursor-pointer"
          />
          <label :for="item.value" class="text-sm text-black font-medium !pl-1.5 cursor-pointer">{{
            item.label
          }}</label>
        </div>
      </div>
      <AuthInput v-model="formData.birthDay" :type="'date'" name="date" />
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
import { ref, reactive } from 'vue'
import { Form } from 'vee-validate'
import { SignUpSchema } from '@/schemas/SignUpSchema'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'primevue'

import AuthInput from '@/components/auth/AuthInput.vue'
import AuthGoogle from '@/components/auth/AuthGoogle.vue'

const authStore = useAuthStore()
const toast = useToast()
const dataGender = ref([
  {
    label: 'Nam',
    value: 'nam',
  },
  {
    label: 'Nữ',
    value: 'nu',
  },
])

const formData = reactive({
  username: '',
  gender: 'Nam',
  birthDay: '',
  email: '',
  password: '',
})

const handleAuth = () => {
  authStore.component = 'login'
}

const handleSubmit = async () => {
  // console.log('Data:', { ...formData })
  const submitData = { ...formData }
  const response = await authStore.handleRegister(
    submitData as { email: string; password: string; username: string },
  )
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
