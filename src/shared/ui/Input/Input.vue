<script setup lang="ts">
import { computed, useId } from 'vue'

import styles from './Input.module.scss'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    hint?: string
    error?: string
    type?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    autocomplete?: string
    name?: string
    id?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
    disabled: false,
    required: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const generatedId = useId()
const inputId = computed(() => props.id ?? generatedId)
const hintId = computed(() => `${inputId.value}-hint`)
const errorId = computed(() => `${inputId.value}-error`)

const describedBy = computed(() => {
  const ids: string[] = []
  if (props.error) ids.push(errorId.value)
  else if (props.hint) ids.push(hintId.value)
  return ids.length > 0 ? ids.join(' ') : undefined
})

function onInput(event: Event): void {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="styles.field">
    <label v-if="label" :for="inputId" :class="styles.label">
      {{ label }}
      <span v-if="required" :class="styles.required" aria-hidden="true">*</span>
    </label>
    <input
      :id="inputId"
      :class="[styles.control, error ? styles.invalid : null]"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :name="name"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      :aria-required="required || undefined"
      @input="onInput"
    />
    <p v-if="error" :id="errorId" :class="styles.error" role="alert">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="hintId" :class="styles.hint">
      {{ hint }}
    </p>
  </div>
</template>
