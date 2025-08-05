<template>
  <div
    :style="{ background: bgColor }"
    class="flex items-center justify-center absolute inset-0 bg-white z-10"
  >
    <div
      :class="{ '!w-[60px] !h-[60px] !border-[8px]': isMobile }"
      class="loader w-[100px] h-[100px] rounded-full border-[12px] border-[#f3f3f3] !border-t-[#3498db]"
    ></div>
  </div>
</template>
<script setup lang="ts">
import { useDevice } from '@/utils/deviceMixin'

defineProps({
  text: String,
  bgColor: {
    type: String,
    default: 'white',
  },
})

const { isMobile, isTablet, isDesktop } = useDevice()
</script>

<style scoped>
.loader {
  -webkit-animation: spin 1.5s linear infinite; /* Safari */
  animation: spin 1.5s linear infinite;
}

/* Safari */
@-webkit-keyframes spin {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
