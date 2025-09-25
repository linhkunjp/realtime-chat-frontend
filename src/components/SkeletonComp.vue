<template>
  <div class="flex items-center gap-3 px-6 py-4">
    <div class="relative animate-pulse">
      <div class="h-[54px] min-w-[54px] rounded-full bg-[#efefef] dark:bg-[#2a2a2a]"></div>
    </div>
    <div class="w-full animate-pulse">
      <p class="h-4 w-48 rounded-full bg-[#efefef] dark:bg-[#2a2a2a]"></p>
      <p class="h-3 w-20 rounded-full bg-[#efefef] dark:bg-[#2a2a2a] mt-2"></p>
    </div>
    <button v-if="!isDesktop && isUser" @click="chatStore.showMenu(false)" class="hover:opacity-50">
      <img src="@/assets/imgs/ic-close-2.svg" />
    </button>
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
      <img class="w-[26px] h-[22px]" src="@/assets/imgs/ic-menu.svg" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useDarkModeStore } from '@/stores/darkMode'
import { useDevice } from '@/utils/deviceMixin'
import { useChatStore } from '@/stores/chatStore'

defineProps({
  isOther: {
    type: Boolean,
    default: false,
  },
  isUser: {
    type: Boolean,
    default: false,
  },
})

const darkModeStore = useDarkModeStore()
const chatStore = useChatStore()
const { isDesktop } = useDevice()

onMounted(() => {
  darkModeStore.updateHtmlClass()
})
</script>
