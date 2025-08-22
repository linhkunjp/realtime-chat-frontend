<template>
  <div>
    <span class="text-black text-sm font-medium opacity-90 block !mb-1.5"
      >{{ placeholder }} <span v-if="isRequired" class="text-[red]"> *</span></span
    >
    <Field
      v-slot="{ field, errorMessage }"
      @update:modelValue="updateValue"
      :name="name"
      :value="modelValue"
      :validateOnChange="true"
      :validateOnBlur="false"
    >
      <input
        :placeholder="placeholder"
        :type="type"
        v-bind="field"
        :class="{
          'mb-5 focus:!border-[#5d87ff]': !errorMessage,
          '!border-[red]': errorMessage,
        }"
        class="!border !border-[#e5eaef] min-h-[48px] text-black rounded-lg outline-none h-full w-full px-4 py-3"
      />

      <span
        v-if="errorMessage"
        class="text-sm text-[red] font-medium opacity-80 block !mt-2 mb-3"
        >{{ errorMessage }}</span
      >
    </Field>
  </div>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate'

defineProps({
  name: { type: String, required: true },
  placeholder: String,
  type: String,
  modelValue: String,
  isRequired: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const updateValue = (value: string) => {
  emit('update:modelValue', value)
}
</script>
