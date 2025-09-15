<template>
  <div class="h-full">
    <div class="flex items-center">
      <ProfileComp
        :name="authStore.username"
        :email="authStore.email"
        :image="authStore.image"
        :isUser="true"
        class="flex-1"
      />

      <button
        @click="handleLogout"
        class="text-xl text-white mr-4 px-3 py-2 hover:bg-[#3b3b4126] rounded-full"
      >
        <i class="fa-solid fa-power-off"></i>
      </button>
    </div>

    <!-- Search -->
    <div class="border border-[#dfe5ef] rounded-lg h-[42px] flex items-center py-6 mt-4 mb-6 mx-6">
      <input
        v-model="searchTerm"
        class="outline-none border-none w-full h-[42px] pl-5"
        placeholder="Search by name"
      />
      <button class="border-none outline-none px-3 py-2">
        <img class="w-[21px] h-[21px]" src="@/assets/imgs/ic-search.svg" />
      </button>
    </div>

    <!-- List user -->
    <div class="max-h-[calc(100%-177px)] overflow-y-auto mt-2.5">
      <div
        v-for="(item, index) in filteredChats"
        :key="index"
        @click="getConversation(item.username, item.userId, item.image)"
        :class="{ 'bg-[#ebf0ff]': chatStore.otherId == item.userId }"
        class="hover:bg-[#f6f6f6] cursor-pointer"
      >
        <ProfileComp
          :name="item.username"
          :lastMessage="item.lastMessage"
          :lastSenderId="item.lastSenderId"
          :image="item.image"
          :isMessage="true"
          :id="item.userId"
          :isReaded="item.isReaded"
        />
      </div>
    </div>

    <Toast position="top-center" group="bc" class="messages">
      <template #message="slotProps">
        <div
          @click="
            getConversation(
              slotProps.message.summary,
              slotProps.message.senderId,
              slotProps.message.image,
            )
          "
          class="flex flex-col items-start flex-auto cursor-pointer"
        >
          <div class="flex items-center gap-2 ml-2">
            <span class="font-bold">{{ slotProps.message.summary }}</span>
          </div>
          <div class="font-regular text-sm ml-2">{{ slotProps.message.detail }}</div>
          <!-- <p class="font-bold">{{ slotProps.message.image }}</p>
          <p class="font-bold">{{ slotProps.message.senderId }}</p> -->
        </div>
      </template>
    </Toast>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDevice } from '@/utils/deviceMixin'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/auth'
import { useModalStore } from '@/stores/modal'

import { useToast } from 'primevue'
import Toast from 'primevue/toast'
import ProfileComp from '../ProfileComp.vue'
import type { ToastMessageOptions } from 'primevue/toast'

interface CustomToastMessage extends ToastMessageOptions {
  senderId: string
  image: string
  id: string
}

const { isMobile, isTablet } = useDevice()
const chatStore = useChatStore()
const authStore = useAuthStore()
const searchTerm = ref('')
const toast = useToast()

const modalStore = useModalStore()

// Lọc danh sách user theo tên
const filteredChats = computed(() => {
  if (!searchTerm.value) return chatStore.listChats
  return chatStore.listChats.filter((chat) =>
    chat.username.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

const getConversation = async (dataName: string, otherId: string, image: string) => {
  // toast.removeAllGroups()
  toast.remove({ id: otherId } as CustomToastMessage)
  if (isTablet || isMobile) {
    chatStore.showMenu(false)
  }
  // Return nếu đang trong đoạn chat
  if (otherId == chatStore.otherId) return

  // Gán tên, id của người cần chat
  chatStore.userName = dataName
  chatStore.otherId = otherId
  chatStore.image = image

  // Kiểm tra đã có cache
  if (chatStore.messagesCache.has(otherId)) {
    chatStore.messages = chatStore.messagesCache.get(otherId)!
  } else {
    await chatStore.getChatDetail(otherId, chatStore.userId)
    chatStore.messagesCache.set(otherId, [...chatStore.messages])
  }

  chatStore.markAsRead(chatStore.userId, otherId)
}

const handleLogout = () => {
  modalStore.openModal(true)
}

// Theo dõi listChats từ store
watch(
  () => chatStore.listChats,
  (newVal) => {
    if (!newVal) return
    // Lấy chat mới nhất
    const latestChat = newVal[0]

    // Nếu tin nhắn cuối chưa đọc và không phải do mình gửi thì show toast
    if (latestChat && !latestChat.isReaded && latestChat.lastSenderId !== chatStore.userId) {
      toast.add({
        severity: 'secondary',
        summary: `${latestChat.username}`,
        detail: `${latestChat.lastMessage}`,
        image: `${latestChat.image}`,
        senderId: `${latestChat.userId}`,
        id: latestChat.userId,
        group: 'bc',
        life: 600000,
      } as CustomToastMessage)
    }
  },
  { deep: true },
)
</script>
