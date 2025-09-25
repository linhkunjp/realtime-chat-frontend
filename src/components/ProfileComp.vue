<template>
  <div class="flex items-center gap-3 px-6 py-4">
    <div class="relative">
      <img
        :src="image || ProfileImg"
        :class="isMessage ? 'h-[50px] min-w-[50px]' : ' h-[54px] min-w-[54px]'"
        class="rounded-full border border-[#dfe5ef] dark:border-[#272A30]"
      />
      <div
        v-if="!isUser"
        :class="chatStore.isUserOnline(id) ? 'bg-[green]' : 'bg-[#d43434]'"
        class="absolute w-3 h-3 rounded-full right-[1px] bottom-0.5 border-2 border-white dark:border-[#17191C]"
      ></div>
    </div>
    <div class="w-full text-black dark:text-white">
      <p class="text-sm font-semibold mb-0.5 last">{{ name }}</p>
      <p v-if="isUser" class="text-xs last">{{ email }}</p>
      <p v-if="isOther" class="text-xs">
        <span>{{ chatStore.isUserOnline(id) ? 'online' : 'offline' }}</span>
      </p>
      <p
        v-if="isMessage"
        :class="{
          'text-black dark:text-white font-semibold':
            isReaded == false && chatStore.userId !== lastSenderId,
        }"
        class="text-xs text-[#747881] last"
      >
        {{ lastMessage || `Hãy bắt đầu cuộc hội thoại với ${name}` }}
      </p>
    </div>

    <button v-if="!isDesktop && isUser" @click="chatStore.showMenu(false)" class="hover:opacity-50">
      <img src="@/assets/imgs/ic-close-2.svg" />
    </button>

    <div class="flex flex-col items-end gap-1.5">
      <p
        v-if="chatStore.getUnreadCount(id) > 1"
        class="whitespace-nowrap text-xs text-white font-semibold bg-[#FF3742] rounded-[999px] px-2 py-0.5 w-fit"
      >
        {{ `${chatStore.getUnreadCount(id)}` }}
      </p>

      <div
        v-if="chatStore.getUnreadCount(id) == 1"
        class="min-w-3 min-h-3 w-3 h-3 rounded-full bg-blue-600"
      ></div>

      <p
        :class="{
          'text-black dark:text-white font-semibold':
            isReaded == false && chatStore.userId !== lastSenderId,
        }"
        class="text-[#747881] text-xs whitespace-nowrap"
      >
        {{ formatDate(lastMessageTime, true) }}
      </p>
    </div>

    <div v-if="isOther">
      <input
        :checked="darkModeStore.isDark"
        @click="darkModeStore.toggleDarkMode"
        type="checkbox"
        class="theme-checkbox hidden"
        id="theme-toggle"
      />
      <label
        for="theme-toggle"
        class="theme-checkbox-label relative cursor-pointer rounded-full flex items-center justify-center gap-2"
      >
        <img src="@/assets/imgs/ic-light.svg" />
        <img src="@/assets/imgs/ic-dark.svg" />
      </label>
    </div>

    <button
      v-if="!isDesktop && isOther"
      @click="chatStore.showMenu(true)"
      class="border-none outline-none py-2 px-2.5 rounded-sm hover:opacity-50"
    >
      <img class="w-[26px] min-w-5 h-[22px]" src="@/assets/imgs/ic-menu.svg" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDevice } from '@/utils/deviceMixin'
import { useChatStore } from '@/stores/chatStore'
import { useDarkModeStore } from '@/stores/darkMode'
import { formatDate } from '@/utils/methods'

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
  lastMessageTime: {
    type: String,
    default: '',
  },
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
const darkModeStore = useDarkModeStore()

onMounted(() => {
  darkModeStore.updateHtmlClass()
})
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
