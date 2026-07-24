<script setup lang="ts">
import { computed } from 'vue'

import styles from './Button.module.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    loading: false,
    disabled: false,
  },
)

const isDisabled = computed(() => props.disabled || props.loading)

const rootClass = computed(() => [
  styles.root,
  styles[props.variant],
  styles[props.size],
  props.loading ? styles.loading : null,
])
</script>

<template>
  <button
    :type="type"
    :class="rootClass"
    :disabled="isDisabled"
    :aria-busy="loading || undefined"
    :aria-disabled="isDisabled || undefined"
  >
    <span v-if="loading" :class="styles.loadingSlot" aria-hidden="true">
      <span :class="styles.spinner" />
    </span>
    <span :class="[styles.content, loading ? styles.labelHidden : null]">
      <slot name="leading" />
      <slot />
      <slot name="trailing" />
    </span>
  </button>
</template>
