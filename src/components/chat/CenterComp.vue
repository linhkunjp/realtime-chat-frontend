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
    <div ref="heightMain" class="h-full my-6 mx-6 overflow-y-auto overflow-x-hidden scrollbar">
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
              :class="{
                'ml-auto': item.senderId == userId,
                'bg-amber-200': item.senderId == userId && item.text !== '',
                'bg-[pink]': item.senderId !== userId && item.text !== '',
              }"
              class="relative w-fit max-w-[80%] rounded-xl group/tooltip"
            >
              <div
                v-if="item.images && item.images.length > 0"
                class="mt-2 grid gap-2 bg-transparent"
                :class="{
                  'grid-cols-1': item.images.length === 1,
                  'grid-cols-2': item.images.length === 2,
                  'grid-cols-3': item.images.length >= 3,
                  'mb-3': item.reactions && item.reactions.length > 0,
                }"
              >
                <div v-for="(img, idx) in item.images" :key="idx" class="relative">
                  <img
                    :src="img"
                    @click="openLightbox(item.images, idx)"
                    class="rounded-lg w-full h-48 object-cover cursor-pointer"
                  />

                  <div
                    v-if="item.isPending"
                    class="absolute w-full h-full top-0 right-0 bg-[#00000066] rounded-lg flex items-center justify-center"
                  >
                    <div
                      class="loader w-[40px] h-[40px] rounded-full border-4 border-[#f3f3f3] !border-t-[#3498db]"
                    ></div>
                  </div>
                </div>
                <vue-easy-lightbox
                  :visible="lightboxVisible"
                  :imgs="lightboxImages"
                  :index="lightboxIndex"
                  @hide="lightboxVisible = false"
                />
              </div>

              <p
                v-if="item.text !== ''"
                :class="{
                  'mb-3': item.reactions && item.reactions.length > 0,
                }"
                class="w-fit px-4 py-2 text-justify text-sm leading-5 flex items-center"
              >
                {{ item.text }}
              </p>

              <!-- Tooltip -->
              <span
                :class="[item.senderId !== userId ? 'left-1/2' : 'right-1/2']"
                class="absolute z-1 top-full mt-1 opacity-0 group-hover/tooltip:opacity-100 transition bg-[#eae8e8] text-black text-xs px-2.5 py-2 rounded-xl whitespace-nowrap pointer-events-none"
              >
                {{ new Date(item.createdAt).toLocaleString() }}
              </span>
              <div
                v-if="item.reactions && item.reactions.length > 0"
                class="absolute bottom-[-10px] right-1"
              >
                <div
                  v-for="(r, idx) in item.reactions"
                  :key="idx"
                  class="rounded-full ring-2 ring-[#252728ba] shadow-xl/30 max-h-[15px] max-w-[15px]"
                >
                  <img :src="getIcon(r.type)" />
                </div>
              </div>

              <!-- Reaction -->
              <div
                v-if="item.senderId !== userId"
                :class="[item.senderId == userId ? 'left-[-40px]' : 'right-[-40px]']"
                class="absolute top-0 bottom-0 flex items-center"
              >
                <div
                  class="relative hidden hover:bg-[#3b3b4126] rounded-full group-hover:flex items-center group/icon p-2.5 cursor-pointer"
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
    <div class="mx-6 mb-6 flex items-end">
      <div
        ref="inputContainer"
        class="border border-[#d9d9d9] rounded-2xl flex items-center w-full flex-col"
      >
        <div class="w-full">
          <div
            v-if="imageFileData && imageFileData.length > 0"
            class="flex gap-2 w-full mx-2.5 mt-2 mb-2"
          >
            <label
              for="add_image"
              class="max-w-[64px] max-h-[64px] min-w-[64px] min-h-[64px] rounded-2xl bg-black hover:bg-[#3b3b4126] cursor-pointer flex items-center justify-center"
            >
              <i class="fa-solid fa-images text-white text-2xl"></i>
              <input
                class="hidden"
                id="add_image"
                name="add_image"
                type="file"
                accept=".jpg, .jpeg, .png"
                multiple
                @change="handleChange"
              />
            </label>
            <div class="relative" v-for="(file, index) in imageFileData" :key="index">
              <img
                :src="file.preview"
                class="max-w-[64px] max-h-[64px] min-w-[64px] min-h-[64px] rounded-2xl"
              />
              <button
                @click="removeFile(index)"
                class="absolute rounded-full bg-white px-1.5 top-1 right-1"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="flex items-center w-full">
          <textarea
            ref="textarea"
            v-model="newMessage"
            @input="validateInput"
            @keydown.enter="handleEnterKey"
            class="w-full max-h-[160px] border-none outline-none outline-offset-2 resize-none mr-1 pl-4 pr-2 mt-2 mb-2.5 py-0"
            placeholder="Type a messsage"
            rows="1"
          >
          </textarea>
        </div>
      </div>
      <label
        v-if="imageFileData && imageFileData.length == 0"
        for="image_uploads"
        class="px-3 py-2 ml-1 hover:bg-[#3b3b4126] rounded-2xl cursor-pointer"
      >
        <i class="fa-solid fa-paperclip text-2xl"></i>
        <input
          class="hidden"
          id="image_uploads"
          name="image_uploads"
          type="file"
          accept=".jpg, .jpeg, .png"
          multiple
          @change="handleChange"
        />
      </label>
      <button
        :class="{ 'pointer-events-none opacity-75': newMessage.trim() == '' }"
        class="border-none outline-none py-1.5 px-1.5 ml-1 hover:bg-[#3b3b4126] rounded-2xl"
      >
        <img class="min-w-8" src="@/assets/imgs/ic-send.svg" />
      </button>
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
import VueEasyLightbox from 'vue-easy-lightbox'

import icLike from '@/assets/imgs/ic-like.svg'
import icLove from '@/assets/imgs/ic-love.svg'
import icHaha from '@/assets/imgs/ic-haha.svg'
import icWow from '@/assets/imgs/ic-wow.svg'
import icAngry from '@/assets/imgs/ic-angry.svg'
import ChatService from '@/services/ChatService'

interface ImageFileData {
  name: string
  preview: string
  type: string
  file: File
}

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

const lightboxVisible = ref(false)
const lightboxImages = ref<string[]>([])
const lightboxIndex = ref(0)

const openLightbox = (imgs: string[], idx: number) => {
  lightboxImages.value = imgs
  lightboxIndex.value = idx
  lightboxVisible.value = true
}

const newMessage = ref('')
const heightMain = ref<HTMLDivElement | null>(null)
const textarea = ref<HTMLDivElement | null>(null)
const inputContainer = ref<HTMLDivElement | null>(null)

const imageFileData = ref<ImageFileData[]>([])

// Chọn ảnh upload
const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)

  files.forEach((file) => {
    // Tạo FileReader để đọc file và chuyển thành base64 dùng cho preview
    const reader = new FileReader()
    reader.onload = (e) => {
      // Ép kiểu string vì dùng base64
      const preview = e.target?.result as string
      imageFileData.value.push({
        file,
        name: file.name,
        preview,
        type: file.type,
      })
    }
    reader.readAsDataURL(file)
  })

  // Reset để chọn lại cùng 1 file
  target.value = ''
  textarea.value?.focus()
}

// Xóa ảnh
const removeFile = (index: number) => {
  if (imageFileData.value) {
    imageFileData.value.splice(index, 1)

    imageFileData.value = [...imageFileData.value]
    textarea.value?.focus()
  }
}

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

// Chỉnh lại chiều cao textarea
const autoResize = () => {
  if (!textarea.value || !heightMain.value || !inputContainer.value) return

  // Đặt chiều cao của textarea về auto, sau đó điều chỉnh chiều cao theo scrollHeight
  textarea.value.style.height = 'auto'
  textarea.value.style.height = textarea.value.scrollHeight + 'px'

  // Điều chỉnh chiều cao của input container
  inputContainer.value.style.height = 'auto'
  scrollToBottom()
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

const sendMessage = async () => {
  if (!newMessage.value.trim() && imageFileData.value.length === 0) return
  if (chatStore.messages.some((m) => m.isPending)) return

  const text = newMessage.value.trim()
  newMessage.value = ''
  if (textarea.value) textarea.value.style.height = 'auto'

  if (text) {
    // Gửi ngay với message chỉ chứa text, push lên server
    chatStore.sendMessage(text, chatStore.otherId, [], { emit: true, pushLocal: true })
  }

  if (imageFileData.value.length > 0) {
    const files = imageFileData.value.map((i) => i.file as File) // Dùng để push lên server
    const previews = imageFileData.value.map((i) => i.preview) // Hiển thị ngay ngoài ui
    imageFileData.value = []

    // Tạo id dùng chung cho ảnh preview và ảnh push lên server
    const baseTempId = Date.now().toString()

    // Chỉ push lên local với ảnh preview
    chatStore.sendMessage('', chatStore.otherId, previews, {
      emit: false,
      pushLocal: true,
      tempId: baseTempId,
      isPending: true,
    })

    try {
      // Mảng url trả về sau khi đẩy lên server
      const urls = await ChatService.uploadImages(files)

      // Push lên server khi đã có url thật
      chatStore.sendMessage('', chatStore.otherId, urls, {
        emit: true,
        pushLocal: false,
        tempId: baseTempId,
      })
    } catch (err) {
      console.error('Upload images failed: ', err)
    }
  }
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
