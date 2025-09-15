<template>
  <router-view class="h-full" />
  <div>
    <Toast position="top-center" group="tl" class="auth" />
  </div>
  <LoadingComp v-if="authStore.isLoading" :bgColor="'#00000066'" />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import LoadingComp from '@/components/LoadingComp.vue'
import Toast from 'primevue/toast'

const authStore = useAuthStore()
</script>

<style>
.auth .p-toast-message {
  min-width: 500px;
  min-height: 40px;
}

.auth .p-toast-message-content {
  padding: 20px !important;
  align-items: center !important;
}

.auth .p-toast-summary {
  margin-left: 10px !important;
  font-size: 18px !important;
}

.p-toast-close-button {
  margin: 0;
  right: 0;
}

.messages .p-toast-message-secondary {
  background: #27272aab;
}
</style>
