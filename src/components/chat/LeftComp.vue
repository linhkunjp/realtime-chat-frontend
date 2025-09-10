<template>
  <div class="h-full">
    <!-- Infor -->
    <ProfileComp
      :name="authStore.username"
      :email="authStore.email"
      :image="authStore.image"
      :isUser="true"
    />

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

    <!-- Filter -->
    <!-- <div class="mx-6">
      <select>
        <option selected>Recent chat</option>
      </select>
    </div> -->

    <!-- List user -->
    <div class="max-h-[200px] overflow-y-auto mt-2.5">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDevice } from '@/utils/deviceMixin'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/auth'
import ProfileComp from '../ProfileComp.vue'

const { isTablet } = useDevice()
const chatStore = useChatStore()
const authStore = useAuthStore()
const searchTerm = ref('')

// Lọc danh sách user theo tên
const filteredChats = computed(() => {
  if (!searchTerm.value) return chatStore.listChats
  return chatStore.listChats.filter((chat) =>
    chat.username.toLowerCase().includes(searchTerm.value.toLowerCase()),
  )
})

const getConversation = async (dataName: string, otherId: string, image: string) => {
  // Return nếu đang trong đoạn chat
  if (otherId == chatStore.otherId) return

  // Gán tên, id của người cần chat
  chatStore.userName = dataName
  chatStore.otherId = otherId
  chatStore.image = image

  if (isTablet) {
    chatStore.showMenu(false)
  }

  // Kiểm tra đã có cache
  if (chatStore.messagesCache.has(otherId)) {
    chatStore.messages = chatStore.messagesCache.get(otherId)!
  } else {
    await chatStore.getChatDetail(otherId, chatStore.userId)
    chatStore.messagesCache.set(otherId, [...chatStore.messages])
  }

  chatStore.markAsRead(chatStore.userId, otherId)
}
</script>
