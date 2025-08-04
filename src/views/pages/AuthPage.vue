<template>
  <div class="m-28">
    <div class="h-[40px] border border-[#fe9300] rounded-xl flex items-center w-fit">
      <input v-model="email" class="outline-none border-none" placeholder="emailllll" />
    </div>
    <div class="h-[40px] border border-[#fe9300] rounded-xl flex items-center w-fit">
      <input v-model="password" class="outline-none border-none" placeholder="passs" />
    </div>

    <button @click="submit">Submit</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')

const submit = async () => {
  const submitData = { email: email.value, password: password.value }
  await authStore.handleLogin(submitData as { email: string; password: string })
}
</script>
