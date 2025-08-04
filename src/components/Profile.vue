<template>
  <div class="flex items-center gap-3 px-6 py-4">
    <button
      v-if="!isDesktop && isOther"
      @click="chatStore.showMenu(true)"
      class="border-none outline-none w-[26px] h-[26px] mr-2"
    >
      <img src="@/assets/imgs/ic-menu.svg" />
      <!-- <img v-if="isMobile" src="@/assets/imgs/ic-arrow-left.svg" /> -->
    </button>
    <div
      :class="isMessage ? 'w-[50px] h-[50px]' : 'w-[54px] h-[54px]'"
      class="rounded-full bg-[green]"
    ></div>
    <div>
      <p class="text-sm font-semibold">{{ name }}</p>
      <p v-if="isUser" class="text-xs">{{ career }}</p>
      <p v-if="isOther" class="text-xs">{{ status }}</p>
      <p v-if="isMessage" class="text-xs">{{ lastMessage }}</p>
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
import { ref } from 'vue'
import { useDevice } from '@/utils/deviceMixin'
import { useChatStore } from '@/stores/chatStore'

defineProps({
  image: String,
  name: String,
  career: String,
  status: String,
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

const { isMobile, isTablet, isDesktop } = useDevice()
const chatStore = useChatStore()
</script>
