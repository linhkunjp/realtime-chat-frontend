<template>
  <div class="h-screen flex items-center">
    <div
      v-if="isDesktop"
      class="bg-[#eff3fd] h-full flex items-center justify-center w-full 2xl:max-w-2/3 xl:max-w-7/12 lg:max-w-1/2"
    >
      <img src="@/assets/imgs/bg-auth.svg" />
    </div>
    <div
      class="w-full 2xl:max-w-1/3 xl:max-w-5/12 lg:max-w-1/2 sm:flex items-center justify-center mx-6"
    >
      <div class="">
        <p class="text-2xl font-bold mb-5 sm:mr-[80px] text-black">Welcome to Realtime Chat</p>

        <!-- Form -->
        <AuthLogin v-if="authStore.component == 'login'" />
        <AuthRegister v-if="authStore.component == 'register'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDevice } from '@/utils/deviceMixin'
import AuthLogin from '@/components/auth/AuthLogin.vue'
import AuthRegister from '@/components/auth/AuthRegister.vue'

const { isMobile, isTablet, isDesktop } = useDevice()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')

const submit = async () => {
  const submitData = { email: email.value, password: password.value }
  // await authStore.handleLogin(submitData as { email: string; password: string })
}
</script>
