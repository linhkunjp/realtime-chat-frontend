<template>
  <div class="h-screen flex items-center">
    <div
      v-if="isDesktop"
      class="bg-[#eff3fd] h-full flex items-center justify-center w-full xl:max-w-3/5 lg:max-w-1/2"
    >
      <img src="@/assets/imgs/bg-auth.svg" />
    </div>
    <div class="w-full xl:max-w-2/5 lg:max-w-1/2 flex items-center justify-center">
      <div class="2xl:w-3/5 w-4/5">
        <p class="text-2xl font-bold mb-4">Welcome to Realtime Chat</p>

        <!-- Oauth -->
        <div class="flex items-center gap-3">
          <button class="outline-none px-7 py-3 !border !border-[#e5eaef] rounded-lg w-full">
            Google
          </button>
          <button class="outline-none px-7 py-3 !border !border-[#e5eaef] rounded-lg w-full">
            Facebook
          </button>
        </div>

        <!-- Divider -->
        <div class="divider relative text-center mt-5 mb-10">
          <span class="relative z-1 bg-white px-3 py-2">or sign in with</span>
        </div>

        <!-- Form -->
        <div>
          <div class="!border !border-[#e5eaef] rounded-lg w-full flex items-center">
            <input
              v-model="email"
              class="outline-none border-none h-full w-full px-4 py-3"
              placeholder="emailllll"
            />
          </div>
          <div class="!border !border-[#e5eaef] rounded-lg w-full flex items-center">
            <input
              v-model="password"
              class="outline-none border-none h-full w-full px-4 py-3"
              placeholder="passs"
            />
          </div>

          <button @click="submit">Submit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDevice } from '@/utils/deviceMixin'

const { isMobile, isTablet, isDesktop } = useDevice()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')

const submit = async () => {
  const submitData = { email: email.value, password: password.value }
  // await authStore.handleLogin(submitData as { email: string; password: string })
}
</script>

<style lang="css" scoped>
.divider::after,
.divider::before {
  position: absolute;
  width: 100%;
  border-top: thin solid #e5eaef;
  top: 50%;
  content: '';
  transform: translateY(50%);
}

.divider::after {
  right: 0;
}

.divider::before {
  left: 0;
}
</style>
