<template>
  <!-- Oauth -->
  <div>
    <button
      class="outline-none px-7 py-3 !border !border-[#e5eaef] rounded-lg min-h-[48px] w-full text-sm whitespace-nowrap flex items-center justify-center gap-3 hover:bg-[#f6f6f6] text-black"
    >
      <img class="w-5" src="@/assets/imgs/ic-google.svg" /> {{ text }} với Google
    </button>
  </div>

  <!-- Divider -->
  <div class="divider relative text-center mt-5 mb-8">
    <span class="relative z-1 bg-white text-black px-3 py-2 text-sm lowercase"
      >hoặc {{ text }} với</span
    >
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: String,
})
</script>

<style lang="css">
.divider::after,
.divider::before {
  position: absolute;
  width: 100%;
  border-top: thin solid #e5eaef;
  top: 50%;
  content: '';
  transform: translateY(50%);
}

.divider::after {
  right: 0;
}

.divider::before {
  left: 0;
}
</style>
