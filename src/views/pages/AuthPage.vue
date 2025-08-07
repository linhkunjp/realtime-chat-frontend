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
      <div>
        <p class="text-2xl font-bold mb-5 sm:mr-[80px] text-black">Welcome to Realtime Chat</p>
        <button @click="handleLogout" class="text-xl text-black px-5 py-4">Sign out</button>
        <!-- Form -->
        <SignIn v-if="authStore.component == 'login'" />
        <SignUp v-if="authStore.component == 'register'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useDevice } from '@/utils/deviceMixin'
import SignUp from '@/components/auth/SignUp.vue'
import SignIn from '@/components/auth/SignIn.vue'
import { useClerk } from '@clerk/vue'

const { isDesktop } = useDevice()
const authStore = useAuthStore()
const clerk = useClerk()

const handleLogout = async () => {
  await clerk.value?.signOut()
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('email')
  localStorage.removeItem('username')
  localStorage.removeItem('image')
  window.location.href = '/'
}
</script>
