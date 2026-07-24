<script setup lang="ts">
import { computed, useId } from 'vue'

import styles from './Textarea.module.scss'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    error?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    rows?: number
    name?: string
    id?: string
  }>(),
  {
    modelValue: '',
    disabled: false,
    required: false,
    rows: 4,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const generatedId = useId()
const textareaId = computed(() => props.id ?? generatedId)
const errorId = computed(() => `${textareaId.value}-error`)

function onInput(event: Event): void {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="styles.field">
    <label v-if="label" :for="textareaId" :class="styles.label">
      {{ label }}
      <span v-if="required" :class="styles.required" aria-hidden="true">*</span>
    </label>
    <textarea
      :id="textareaId"
      :class="[styles.control, error ? styles.invalid : null]"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :name="name"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      :aria-required="required || undefined"
      @input="onInput"
    />
    <p v-if="error" :id="errorId" :class="styles.error" role="alert">
      {{ error }}
    </p>
  </div>
</template>
