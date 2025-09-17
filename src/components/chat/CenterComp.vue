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
    </div>

    <!-- Content -->
    <div ref="heightMain" class="h-full my-6 mx-6 overflow-y-auto overflow-x-hidden scrollbar">
      <template v-for="(item, index) in chatStore.messages" :key="item._id || item.tempId">
        <MessageComp :item="item" :index="index" />
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
import ProfileComp from '../ProfileComp.vue'

import ChatService from '@/services/ChatService'
import MessageComp from '../MessageComp.vue'

interface ImageFileData {
  name: string
  preview: string
  type: string
  file: File
}

const chatStore = useChatStore()
const userName = computed(() => chatStore.userName)

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
