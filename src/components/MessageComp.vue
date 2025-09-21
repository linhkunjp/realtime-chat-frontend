<template>
  <div :class="{ 'mb-3': index !== chatStore.messages.length - 1 }" class="flex gap-4 items-start">
    <img
      v-if="item.senderId !== chatStore.userId"
      :src="chatStore.image || ProfileImg"
      class="rounded-full w-[50px] h-[50px]"
    />
    <div class="w-full wrap-anywhere mt-1 group">
      <div
        :class="{
          'ml-auto': item.senderId == chatStore.userId,
          'bg-[#E0F0FF] dark:bg-[#001A3D]': item.senderId == chatStore.userId && item.text !== '',
          'bg-[#E9EAED] dark:bg-[#1C1E22]': item.senderId !== chatStore.userId && item.text !== '',
        }"
        class="relative w-fit max-w-[80%] rounded-2xl"
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
          <div
            v-for="(img, idx) in item.images"
            :key="idx"
            :class="{ 'min-h-[192px] min-w-[153px]': isLoadImg }"
            class="relative"
          >
            <img
              :src="img"
              @load="handleLoadImg"
              @click="openLightbox(item.images, idx)"
              class="rounded-lg w-full h-48 object-cover cursor-pointer"
            />

            <div
              v-if="item.isPending || isLoadImg"
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
          @click="$emit('toggle')"
          :class="{
            'mb-3': item.reactions && item.reactions.length > 0,
          }"
          class="text-black dark:text-white w-fit px-4 py-2 text-sm leading-5"
        >
          {{ item.text }}
        </p>

        <div
          v-if="item.reactions && item.reactions.length > 0"
          class="absolute bottom-[-10px] right-1"
        >
          <div
            v-for="(r, idx) in item.reactions"
            :key="idx"
            class="rounded-full ring-2 ring-[#252728ba] shadow-xl/30 max-h-[16px] max-w-[16px]"
          >
            <img :src="getIcon(r.type)" />
          </div>
        </div>

        <!-- Reaction -->
        <div
          v-if="item.senderId !== chatStore.userId"
          :class="[
            item.senderId == chatStore.userId ? 'left-[-40px]' : 'right-[-40px]',
            {
              ' hidden group-hover:flex': isDesktop,
            },
          ]"
          class="absolute top-0 bottom-0 flex items-center"
        >
          <div
            ref="reactionButton"
            @click="toggleReaction"
            class="relative items-center group/icon p-2.5 rounded-full hover:bg-[#E9EAED] dark:hover:bg-[#1C1E22] cursor-pointer"
          >
            <img src="@/assets/imgs/ic-smile.svg" />

            <div
              ref="reactionBox"
              :class="[
                index == 0 ? 'top-[42px] after:top-[-15px]' : 'top-[-60px] after:bottom-[-14px]',
                { '!flex': isShowReaction },
              ]"
              class="absolute left-1/2 -translate-x-1/2 hidden group-hover/icon:flex justify-center bg-white dark:bg-[#17191C] shadow-lg rounded-3xl px-3.5 py-2.5 gap-3 w-max z-9 cursor-default reaction"
            >
              <button
                v-for="(i, indexReaction) in reactions"
                :key="indexReaction"
                @click="handleReaction(item, i.type)"
              >
                <img
                  :src="i.icon"
                  class="w-[34px] min-w-[34px] transition-transform duration-150 ease-in-out hover:scale-125"
                />
              </button>

              <div
                :class="index == 0 ? 'top-[-4px]' : '-bottom-1'"
                class="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white dark:bg-[#17191C] cursor-default"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <p
        v-if="isShowTime"
        :class="[item.senderId == chatStore.userId ? 'ml-auto mr-1' : 'ml-1']"
        class="mt-2 w-fit max-w-[80%] text-black dark:text-white text-xs whitespace-nowrap pointer-events-none"
      >
        {{ formatDate(item.createdAt) }}
      </p>

      <p
        v-if="index === chatStore.messages.length - 1"
        :class="item.senderId == chatStore.userId ? 'ml-auto mr-1' : 'ml-1'"
        class="w-fit rounded-xl text-justify max-w-[80%] text-xs leading-5 text-black dark:text-white"
      >
        {{ dayjs(item.createdAt).fromNow() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import ProfileImg from '@/assets/imgs/profile.png'
import dayjs from '@/utils/dayjs'
import VueEasyLightbox from 'vue-easy-lightbox'
import { useDevice } from '@/utils/deviceMixin'

import icLike from '@/assets/imgs/ic-like.svg'
import icLove from '@/assets/imgs/ic-love.svg'
import icHaha from '@/assets/imgs/ic-haha.svg'
import icWow from '@/assets/imgs/ic-wow.svg'
import icAngry from '@/assets/imgs/ic-angry.svg'

import type { MessageData } from '@/types/message'
import { formatDate } from '@/utils/methods'

const { item, index, isShowTime } = defineProps<{
  item: MessageData
  index: number
  isShowTime: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()

const { isDesktop } = useDevice()
const chatStore = useChatStore()
const lightboxVisible = ref(false)
const lightboxImages = ref<string[]>([])
const lightboxIndex = ref(0)
const isLoadImg = ref(true)

const isShowReaction = ref(false)
const reactionBox = ref<HTMLElement | null>(null)
const reactionButton = ref<HTMLElement | null>(null)

const reactions = ref([
  { type: 'like', icon: icLike },
  { type: 'love', icon: icLove },
  { type: 'haha', icon: icHaha },
  { type: 'wow', icon: icWow },
  { type: 'angry', icon: icAngry },
])

const handleLoadImg = () => {
  isLoadImg.value = false
}

const openLightbox = (imgs: string[], idx: number) => {
  lightboxImages.value = imgs
  lightboxIndex.value = idx
  lightboxVisible.value = true
}

const getIcon = (type: string) => {
  const r = reactions.value.find((re) => re.type === type)
  return r ? r.icon : type
}

const handleReaction = (message: MessageData, type: string) => {
  chatStore.handleReaction(message, type)
}

const toggleReaction = () => {
  isShowReaction.value = !isShowReaction.value
}

// Đóng reaction khi click bên ngoài
const closeReactionOnClickOutside = (event: Event) => {
  if (
    reactionBox.value &&
    !reactionBox.value.contains(event.target as Node) &&
    reactionButton.value &&
    !reactionButton.value.contains(event.target as Node)
  ) {
    isShowReaction.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeReactionOnClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeReactionOnClickOutside)
})
</script>

<style lang="css" scoped>
.reaction::after {
  content: '';
  display: block;
  width: 60px;
  height: 16px;
  background-color: transparent;
  position: absolute;
}
</style>
