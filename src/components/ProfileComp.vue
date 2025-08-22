<template>
  <div class="flex items-center gap-3 px-6 py-4">
    <button
      v-if="!isDesktop && isOther"
      @click="chatStore.showMenu(true)"
      class="border-none outline-none w-[26px] h-[26px] mr-2"
    >
      <img src="@/assets/imgs/ic-menu.svg" />
    </button>
    <div class="relative">
      <img
        :src="image || ProfileImg"
        :class="isMessage ? 'w-[50px] h-[50px] min-w-[50px]' : 'w-[54px] h-[54px] min-w-[50px]'"
        class="rounded-full"
      />
      <div
        v-if="!isUser"
        :class="chatStore.isUserOnline(id) ? 'bg-[green]' : 'bg-[#d43434]'"
        class="absolute w-3 h-3 rounded-full right-[1px] bottom-0.5 border-2"
      ></div>
    </div>
    <div>
      <p class="text-sm font-semibold mb-0.5">{{ name }}</p>
      <p v-if="isUser" class="text-xs">{{ email }}</p>
      <p v-if="isOther" class="text-xs">
        <span class="text-black">{{ chatStore.isUserOnline(id) ? 'online' : 'offline' }}</span>
      </p>
      <p v-if="isMessage" class="text-xs last">{{ lastMessage }}</p>
    </div>

    <button
      v-if="isTablet && isUser"
      @click="chatStore.showMenu(false)"
      class="border-none outline-none w-[26px] h-[26px] ml-auto"
    >
      <img src="@/assets/imgs/ic-close.svg" />
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
})

const { isTablet, isDesktop } = useDevice()
const chatStore = useChatStore()
</script>

<style lang="css" scoped>
p.last {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
