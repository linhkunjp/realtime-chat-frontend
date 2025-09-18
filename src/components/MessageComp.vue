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
          class="text-black dark:text-white w-fit px-4 py-2 text-justify text-sm leading-5 flex items-center"
        >
          {{ item.text }}
        </p>

        <!-- Tooltip -->
        <span
          :class="[item.senderId !== chatStore.userId ? 'left-1/2' : 'right-1/2']"
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
          v-if="item.senderId !== chatStore.userId"
          :class="[item.senderId == chatStore.userId ? 'left-[-40px]' : 'right-[-40px]']"
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
        :class="item.senderId == chatStore.userId ? 'ml-auto mr-1' : 'ml-1'"
        class="w-fit rounded-xl text-justify max-w-[80%] text-xs leading-5"
      >
        {{ dayjs(item.createdAt).fromNow() }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChatStore } from '@/stores/chatStore'
import ProfileImg from '@/assets/imgs/profile.png'
import dayjs from '@/utils/dayjs'
import VueEasyLightbox from 'vue-easy-lightbox'

import icLike from '@/assets/imgs/ic-like.svg'
import icLove from '@/assets/imgs/ic-love.svg'
import icHaha from '@/assets/imgs/ic-haha.svg'
import icWow from '@/assets/imgs/ic-wow.svg'
import icAngry from '@/assets/imgs/ic-angry.svg'

import type { MessageData } from '@/types/message'

const { item, index } = defineProps<{
  item: MessageData
  index: number
}>()

const chatStore = useChatStore()
const lightboxVisible = ref(false)
const lightboxImages = ref<string[]>([])
const lightboxIndex = ref(0)
const isShowTime = ref(-1)

const reactions = ref([
  { type: 'like', icon: icLike },
  { type: 'love', icon: icLove },
  { type: 'haha', icon: icHaha },
  { type: 'wow', icon: icWow },
  { type: 'angry', icon: icAngry },
])

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
</script>
