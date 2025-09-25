<template>
  <router-view class="h-full" />
  <div>
    <Toast position="top-center" group="tl" class="auth" />
  </div>
  <LoadingComp v-if="authStore.isLoading" :bgColor="'#00000066'" />
  <ModalComp />
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import LoadingComp from '@/components/LoadingComp.vue'
import Toast from 'primevue/toast'
import ModalComp from '@/components/ModalComp.vue'

const authStore = useAuthStore()
</script>

<style>
.auth .p-toast-message {
  min-height: 40px;
}

.auth .p-toast-message-content {
  padding: 20px !important;
  align-items: center !important;
}

.auth .p-toast-summary {
  margin-left: 10px !important;
  margin-right: 10px !important;
  font-size: 18px !important;
}

.p-toast-close-button {
  margin: 0;
  right: 0;
}

.messages .p-toast-message-secondary {
  background: #27272aab;
}

.messages .p-toast-message-content {
  align-items: center !important;
  padding-right: 20px;
}

.p-toast.auth {
  max-width: 100% !important;
  width: max-content !important;
}

.p-toast.messages {
  max-width: 100% !important;
  min-width: max-content !important;
}

.p-toast-message {
  margin: 0 20px 20px !important;
}
</style>
