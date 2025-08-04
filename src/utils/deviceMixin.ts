import { onMounted, onBeforeUnmount, ref } from 'vue'

export function useDevice() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)

  const checkDevice = () => {
    const width = window.innerWidth
    if (width <= 768) {
      isMobile.value = true
      isTablet.value = false
      isDesktop.value = false
    } else if (width > 768 && width <= 1024) {
      isMobile.value = false
      isTablet.value = true
      isDesktop.value = false
    } else {
      isMobile.value = false
      isTablet.value = false
      isDesktop.value = true
    }
  }

  onMounted(() => {
    checkDevice()
    window.addEventListener('resize', checkDevice)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', checkDevice)
  })

  return { isMobile, isTablet, isDesktop }
}
