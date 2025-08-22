<template>
  <div class="h-ful flex flex-col">
    <!-- Header -->
    <div class="border-b border-[#dfe5ef]">
      <ProfileComp
        :name="userName"
        :isOther="true"
        :image="chatStore.image"
        :id="chatStore.otherId"
      />
      <button @click="handleLogout" class="text-xl text-black px-5 py-4">Sign out</button>
    </div>

    <!-- Content -->
    <div ref="heightMain" class="h-full my-6 mx-6 overflow-y-auto scrollbar">
      <template v-for="(item, index) in chatStore.messages" :key="item._id || item.tempId">
        <div
          :class="{ 'mb-3': index !== chatStore.messages.length - 1 }"
          class="flex gap-4 items-start"
        >
          <img
            v-if="item.senderId !== userId"
            :src="chatStore.image || ProfileImg"
            class="rounded-full w-[50px] h-[50px]"
          />
          <div class="w-full wrap-anywhere mt-1 group">
            <div
              :class="item.senderId == userId ? 'ml-auto bg-amber-200' : 'bg-[pink]'"
              class="relative w-fit max-w-[80%] rounded-xl"
            >
              <p
                @click="isShowTime = index"
                class="w-fit px-4 py-2 text-justify text-sm leading-5 flex items-center"
              >
                {{ item.text }}
              </p>
              <div
                v-if="item.reactions && item.reactions.length"
                class="absolute bottom-[-10px] right-1"
              >
                <span v-for="(r, idx) in item.reactions" :key="idx">
                  <img :src="getIcon(r.type)" class="w-5 min-w-5" />
                </span>
              </div>

              <div
                v-if="item.senderId !== userId"
                :class="[item.senderId == userId ? 'left-[-36px]' : 'right-[-36px]']"
                class="absolute top-0 bottom-0 flex items-center"
              >
                <div
                  class="relative hidden group-hover:flex items-center group/icon p-2.5 cursor-pointer"
                >
                  <i class="fa-regular fa-face-smile"></i>

                  <div
                    :class="index == 0 ? 'top-[36px]' : 'top-[-52px]'"
                    class="absolute left-1/2 -translate-x-1/2 hidden group-hover/icon:flex bg-white shadow-lg rounded-3xl px-3.5 py-2.5 gap-3 w-max z-9 cursor-default"
                  >
                    <button
                      v-for="(i, index) in reactions"
                      :key="index"
                      @click="handleReaction(item, i.type)"
                    >
                      <img
                        :src="i.icon"
                        class="w-[34px] min-w-[34px] transition-transform duration-150 ease-in-out hover:scale-125"
                      />
                    </button>

                    <div
                      :class="index == 0 ? 'top-[-4px]' : '-bottom-1'"
                      class="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white cursor-default"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <p
              v-if="index === chatStore.messages.length - 1 || index == isShowTime"
              :class="item.senderId == userId ? 'ml-auto mr-1' : 'ml-1'"
              class="w-fit rounded-xl text-justify max-w-[80%] text-xs leading-5"
            >
              {{ dayjs(item.createdAt).fromNow() }}
            </p>
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div class="mx-6 mb-6">
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
import { useClerk } from '@clerk/vue'
import type { MessageData } from '@/types/message'
import ProfileComp from '../ProfileComp.vue'
import ProfileImg from '@/assets/imgs/profile.png'
import dayjs from '@/utils/dayjs'

import icLike from '@/assets/imgs/ic-like.svg'
import icLove from '@/assets/imgs/ic-love.svg'
import icHaha from '@/assets/imgs/ic-haha.svg'
import icWow from '@/assets/imgs/ic-wow.svg'
import icAngry from '@/assets/imgs/ic-angry.svg'

const chatStore = useChatStore()
const userName = computed(() => chatStore.userName)
const userId = ref(chatStore.userId)
const clerk = useClerk()
const isShowTime = ref(-1)
const reactions = ref([
  { type: 'like', icon: icLike },
  { type: 'love', icon: icLove },
  { type: 'haha', icon: icHaha },
  { type: 'wow', icon: icWow },
  { type: 'angry', icon: icAngry },
])

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

const getIcon = (type: string) => {
  const r = reactions.value.find((re) => re.type === type)
  return r ? r.icon : type
}

// Cuộn xuống dưới cùng màn chat
const scrollToBottom = () => {
  if (heightMain.value) {
    heightMain.value.scroll({
      top: heightMain.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// Xử lý khi nhấn enter
const handleEnterKey = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
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

function handleReaction(message: MessageData, type: string) {
  chatStore.handleReaction(message, type)
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
  setInterval(() => {
    chatStore.messages = [...chatStore.messages]
  }, 60000)
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
