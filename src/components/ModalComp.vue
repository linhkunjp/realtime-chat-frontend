<template>
  <div v-if="modalStore.isOpen" :class="{ invisible: authStore.isLoading == true }">
    <!-- Modal -->
    <div
      :class="[isMobile ? 'w-[90%]' : 'w-fit']"
      class="bg-white fixed left-0 right-0 !mx-auto z-100 overflow-y-auto top-[40%] rounded-3xl"
    >
      <div class="mx-10 my-8">
        <p class="text-black text-2xl font-medium">Đăng xuất</p>
        <p class="text-black mt-2 mb-8">Bạn có chắc chắn muốn đăng xuất không?</p>
        <div class="text-white flex gap-2 justify-end">
          <button
            @click="handleLogout"
            class="px-3 py-2 bg-black rounded-lg hover:bg-white hover:text-black border"
          >
            Đăng xuất
          </button>
          <button
            @click="openModal(false)"
            class="px-3 py-2 bg-black rounded-lg hover:bg-white hover:text-black border"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay -->
    <div
      @click="openModal(false)"
      class="overlay-modal fixed inset-0 z-99 visible opacity-100"
    ></div>
  </div>
</template>
<script setup lang="ts">
import { useModalStore } from '@/stores/modal'
import { useAuthStore } from '@/stores/auth'
import { useDevice } from '@/utils/deviceMixin'
import { useClerk } from '@clerk/vue'

const { isMobile } = useDevice()
const modalStore = useModalStore()
const authStore = useAuthStore()
const clerk = useClerk()

const openModal = (value: boolean) => {
  modalStore.openModal(value)
}

const handleLogout = async () => {
  authStore.isLoading = true
  await clerk.value?.signOut()
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('email')
  localStorage.removeItem('username')
  localStorage.removeItem('image')
  window.location.href = '/'
}
</script>
