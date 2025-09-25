<template>
  <div class="h-screen max-h-dvh flex bg-white dark:bg-[#17191C]">
    <LeftComp
      :class="[
        {
          'fixed left-0 top-0 bottom-0 z-10 chat-transition': !isDesktop,
          'transform-0 chat-transition ': !isDesktop && !chatStore.isShowLeftComp,
          'transform-100': isDesktop,
          'w-[360px]': !isMobile,
          'right-0': isMobile,
        },
      ]"
    />

    <CenterComp class="flex-1 border-l border-[#dfe5ef] dark:border-[#272A30]" />

    <!-- Overlay -->
    <div
      @click="chatStore.showMenu(false)"
      :class="{ 'visible opacity-100': isTablet && chatStore.isShowLeftComp }"
      class="overlay fixed inset-0 invisible opacity-0 z-9"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import LeftComp from '@/components/chat/LeftComp.vue'
import CenterComp from '@/components/chat/CenterComp.vue'
import { useDevice } from '@/utils/deviceMixin'
import { useChatStore } from '@/stores/chatStore'

const { isMobile, isTablet, isDesktop } = useDevice()
const chatStore = useChatStore()

onMounted(async () => {
  await chatStore.getChatList()
})
</script>

<style lang="css" scoped>
.transform-100 {
  -webkit-transform: translateX(0);
  transform: translateX(0);
}

.transform-0 {
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%);
}

.overlay {
  background: rgba(0, 0, 0, 0.8);
  transition: all 200ms linear;
}

.chat-transition {
  -ms-transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  -webkit-transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
