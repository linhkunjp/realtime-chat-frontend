<template>
  <div class="h-full bg-white dark:bg-[#17191C] flex flex-col">
    <div class="flex items-center">
      <ProfileComp
        :name="authStore.username"
        :email="authStore.email"
        :image="authStore.image"
        :isUser="true"
        class="flex-1"
      />
    </div>

    <!-- Search -->
    <div
      class="border border-[#dfe5ef] dark:border-[#272A30] rounded-2xl h-[36px] flex items-center py-6 mt-4 mb-6 mx-6"
    >
      <button class="border-none outline-none px-3 py-2">
        <img src="@/assets/imgs/ic-search.svg" />
      </button>
      <input
        v-model="searchTerm"
        class="outline-none border-none w-full h-[42px] pr-5 text-black dark:text-white"
        placeholder="Tìm kiếm theo tên"
      />
    </div>

    <!-- List user -->
    <div class="max-h-[calc(100%-177px)] overflow-y-auto mt-2.5">
      <div
        v-for="(item, index) in filteredChats"
        :key="index"
        @click="getConversation(item.username, item.userId, item.image)"
        :class="{ 'bg-[#DBDDE1] dark:bg-[#272A30]': chatStore.otherId == item.userId }"
        class="hover:bg-[#E9EAED] dark:hover:bg-[#1C1E22] cursor-pointer"
      >
        <ProfileComp
          :name="item.username"
          :lastMessage="item.lastMessage"
          :lastMessageTime="item.lastMessageTime"
          :lastSenderId="item.lastSenderId"
          :image="item.image"
          :isMessage="true"
          :id="item.userId"
          :isReaded="item.isReaded"
        />
      </div>
    </div>

    <div
      class="text-black dark:text-white text-lg pr-6 mt-auto border-t border-[#dfe5ef] dark:border-[#272A30]"
    >
      <button @click="handleLogout" class="flex items-center gap-3 py-5 px-6 font-medium">
        <img src="@/assets/imgs/ic-exit.svg" /> Đăng xuất
      </button>
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
      toast.remove({ id: latestChat.userId } as CustomToastMessage)

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
