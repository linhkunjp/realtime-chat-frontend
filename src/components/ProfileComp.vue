<template>
  <div class="flex items-center gap-3 px-6 py-4">
    <div class="relative">
      <img
        :src="image || ProfileImg"
        :class="isMessage ? 'h-[50px] min-w-[50px]' : ' h-[54px] min-w-[54px]'"
        class="rounded-full"
      />
      <div
        v-if="!isUser"
        :class="chatStore.isUserOnline(id) ? 'bg-[green]' : 'bg-[#d43434]'"
        class="absolute w-3 h-3 rounded-full right-[1px] bottom-0.5 border-2"
      ></div>
    </div>
    <div class="w-full">
      <p class="text-sm font-semibold mb-0.5 last">{{ name }}</p>
      <p v-if="isUser" class="text-xs">{{ email }}</p>
      <p v-if="isOther" class="text-xs">
        <span class="text-black">{{ chatStore.isUserOnline(id) ? 'online' : 'offline' }}</span>
      </p>
      <p
        v-if="isMessage"
        :class="{ 'font-semibold': isReaded == false && chatStore.userId !== lastSenderId }"
        class="text-xs last"
      >
        {{ lastMessage }}
      </p>
    </div>
    <div
      v-if="chatStore.getUnreadCount(id) > 1"
      class="whitespace-nowrap text-xs bg-[#aaa8a8] rounded-lg px-1"
    >
      {{ `${chatStore.getUnreadCount(id)}+` }}
    </div>

    <div
      v-if="chatStore.getUnreadCount(id) == 1"
      class="min-w-3 min-h-3 w-3 h-3 rounded-full bg-blue-600"
    ></div>

    <button
      v-if="!isDesktop && isOther"
      @click="chatStore.showMenu(true)"
      class="border-none outline-none w-[26px] h-[26px] mr-2"
    >
      <img src="@/assets/imgs/ic-menu.svg" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useDevice } from '@/utils/deviceMixin'
import { useChatStore } from '@/stores/chatStore'
import ProfileImg from '@/assets/imgs/profile.png'

defineProps({
  image: String,
  name: String,
  email: String,
  id: {
    type: String,
    default: '',
  },
  lastMessage: String,
  lastSenderId: String,
  isUser: {
    type: Boolean,
    default: false,
  },
  isOther: {
    type: Boolean,
    default: false,
  },
  isMessage: {
    type: Boolean,
    default: false,
  },
  isReaded: {
    type: Boolean,
    default: false,
  },
})

const { isDesktop } = useDevice()
const chatStore = useChatStore()
</script>

<style lang="css" scoped>
p.last {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  word-break: break-word;
}
</style>
