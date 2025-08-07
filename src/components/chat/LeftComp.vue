<template>
  <div class="h-full">
    <!-- Infor -->
    <Profile :name="authStore.username" :career="'Designer'" :isUser="true" />

    <!-- Search -->
    <div class="border border-[#dfe5ef] rounded-lg h-[42px] flex items-center py-6 mt-4 mb-6 mx-6">
      <input class="outline-none border-none w-full h-[42px] pl-5" placeholder="Search" />
      <button class="border-none outline-none px-3 py-2">
        <img class="w-[21px] h-[21px]" src="@/assets/imgs/ic-search.svg" />
      </button>
    </div>

    <!-- Filter -->
    <div class="mx-6">
      <select>
        <option selected>Recent chat</option>
      </select>
    </div>

    <!-- List user -->
    <div class="max-h-[200px] overflow-y-auto mt-2.5">
      <div
        v-for="(item, index) in chatStore.listChats"
        :key="index"
        @click="getConversation(item.username, item.userId)"
        :class="{ 'bg-[#ebf0ff]': chatStore.otherId == item.userId }"
        class="hover:bg-[#f6f6f6] cursor-pointer"
      >
        <Profile :name="item.username" :lastMessage="item.lastMessage" :isMessage="true" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDevice } from '@/utils/deviceMixin'
import { useChatStore } from '@/stores/chatStore'
import { useAuthStore } from '@/stores/auth'
import Profile from '../Profile.vue'

const { isMobile, isTablet, isDesktop } = useDevice()
const chatStore = useChatStore()
const authStore = useAuthStore()

const getConversation = async (dataName: string, otherId: string) => {
  // Gán tên, id của người cần chat
  chatStore.userName = dataName
  chatStore.otherId = otherId

  if (isTablet) {
    chatStore.showMenu(false)
  }

  // Kiểm tra đã có cache
  if (chatStore.messagesCache.has(otherId)) {
    chatStore.messages = chatStore.messagesCache.get(otherId)!
  } else {
    await chatStore.getChatDetail(otherId, chatStore.userId)
    chatStore.messagesCache.set(otherId, chatStore.messages)
  }
}
</script>
