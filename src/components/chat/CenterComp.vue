<template>
  <div class="h-ful flex flex-col">
    <!-- Header -->
    <div class="border-b border-[#dfe5ef]">
      <Profile :name="userName" :isOther="true" :image="chatStore.image" />
      <button @click="handleLogout" class="text-xl text-black px-5 py-4">Sign out</button>
    </div>

    <!-- Content -->
    <div ref="heightMain" class="h-full mt-8 mb-6 mx-6 overflow-y-auto scrollbar">
      <template v-for="(item, index) in chatStore.messages" :key="index">
        <div class="flex gap-4 items-start mb-3">
          <div
            v-if="item.senderId !== userId"
            class="min-w-[50px] min-h-[50px] max-w-[50px] max-h-[50px] rounded-full bg-[#ccc]"
          ></div>
          <div class="w-full wrap-anywhere mt-1">
            <p
              :class="item.senderId == userId ? 'bg-amber-200 ml-auto' : 'bg-[pink] '"
              class="w-fit px-4 py-2 rounded-xl text-justify max-w-[80%] text-sm leading-5"
            >
              {{ item.text }}
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div class="mx-6 mb-6">
      <!-- <input class="h-[40px] border border-[#ccc] w-full" placeholder="Send message" /> -->
      <div ref="inputContainer" class="border border-[#d9d9d9] rounded-xl flex items-center">
        <textarea
          ref="textarea"
          v-model="newMessage"
          @input="validateInput"
          @keydown.enter="handleEnterKey"
          class="w-full max-h-[72px] border-none outline-none outline-offset-2 resize-none mr-1 py-3 pl-5 pr-2"
          placeholder="Type a messsage"
          rows="1"
        >
        </textarea>
        <button
          :class="{ 'pointer-events-none opacity-75': newMessage.trim() == '' }"
          class="border-none outline-none p-2.5 pr-4"
        >
          <img class="min-w-fit" src="@/assets/imgs/ic-send.svg" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import Profile from '../Profile.vue'
import { useClerk } from '@clerk/vue'

const chatStore = useChatStore()
const userName = computed(() => chatStore.userName)
const userId = ref(chatStore.userId)
const clerk = useClerk()

const newMessage = ref('')
const heightMain = ref<HTMLDivElement | null>(null)
const textarea = ref<HTMLDivElement | null>(null)
const inputContainer = ref<HTMLDivElement | null>(null)

const handleLogout = async () => {
  await clerk.value?.signOut()
  localStorage.removeItem('token')
  localStorage.removeItem('user_id')
  localStorage.removeItem('email')
  localStorage.removeItem('username')
  localStorage.removeItem('image')
  window.location.href = '/'
}

// Cuộn xuống dưới cùng màn chat
const scrollToBottom = () => {
  if (heightMain.value) {
    // Đảm bảo heightMain không phải là null trước khi gọi scroll
    heightMain.value.scroll({
      top: heightMain.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// Xử lý khi nhấn enter
const handleEnterKey = (event: any) => {
  if (event.keyCode === 13 && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// Validate loại bỏ các khoảng trắng khi gõ, paste vào input
const validateInput = (event: Event): void => {
  const target = event.target as HTMLInputElement // Chuyển đổi kiểu để truy cập value
  const data = target.value

  newMessage.value = data

  // Cắt chuỗi và lấy các từ, loại bỏ các ký tự trắng thừa
  const words = newMessage.value.trim().split(/\s+/).filter(Boolean)

  if (words.length >= 100) {
    // Nếu người dùng bấm space
    if (
      event instanceof InputEvent &&
      event.data === ' ' // Kiểm tra nếu ký tự nhập vào là dấu cách
    ) {
      event.preventDefault()
      newMessage.value = newMessage.value.trim()
    }
  }
  autoResize()
}

const autoResize = () => {
  if (!textarea.value || !heightMain.value || !inputContainer.value) return

  // Đặt chiều cao của textarea về auto, sau đó điều chỉnh chiều cao theo scrollHeight
  textarea.value.style.height = 'auto'
  textarea.value.style.height = textarea.value.scrollHeight + 'px'

  // Điều chỉnh chiều cao của input container
  inputContainer.value.style.height = 'auto'
  scrollToBottom()
}

const sendMessage = () => {
  if (!newMessage.value.trim()) return
  chatStore.sendMessage(newMessage.value, chatStore.otherId)
  if (textarea.value) {
    textarea.value.style.height = 'auto'
  }
  newMessage.value = ''
}

// Theo dõi mảng messages nếu có tin nhắn mới thì cuộn xuống
watch(
  () => chatStore.messages,
  async () => {
    await nextTick()
    setTimeout(() => {
      scrollToBottom()
    }, 200)
  },
  { deep: true, immediate: true },
)

onMounted(async () => {
  chatStore.listenMessages()
})
</script>

<style lang="css" scoped>
textarea {
  transition: height 0.2s ease;
}

.scrollbar::-webkit-scrollbar,
.scroll-y::-webkit-scrollbar {
  width: 5px;
  height: 3px;
}

.scrollbar::-webkit-scrollbar-thumb,
.scroll-y::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 10px;
}

.scrollbar::-webkit-scrollbar-thumb:hover,
.scroll-y::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
  cursor: pointer;
}
</style>
