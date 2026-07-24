<script setup lang="ts">
import { ChevronDown } from '@lucide/vue'
import { computed, useId } from 'vue'

import styles from './Select.module.scss'

export type SelectOption = {
  label: string
  value: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    error?: string
    options: SelectOption[]
    placeholder?: string
    disabled?: boolean
    required?: boolean
    name?: string
    id?: string
  }>(),
  {
    modelValue: '',
    disabled: false,
    required: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const generatedId = useId()
const selectId = computed(() => props.id ?? generatedId)
const errorId = computed(() => `${selectId.value}-error`)

function onChange(event: Event): void {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="styles.field">
    <label v-if="label" :for="selectId" :class="styles.label">
      {{ label }}
      <span v-if="required" :class="styles.required" aria-hidden="true">*</span>
    </label>
    <div :class="styles.controlWrap">
      <select
        :id="selectId"
        :class="[styles.control, error ? styles.invalid : null]"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :name="name"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? errorId : undefined"
        :aria-required="required || undefined"
        @change="onChange"
      >
        <option v-if="placeholder" value="" disabled>
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      <ChevronDown :class="styles.chevron" aria-hidden="true" />
    </div>
    <p v-if="error" :id="errorId" :class="styles.error" role="alert">
      {{ error }}
    </p>
  </div>
</template>
