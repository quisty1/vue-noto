<script setup lang="ts">
import styles from './IconButton.module.scss'

export type IconButtonSize = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    size?: IconButtonSize
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  {
    size: 'md',
    type: 'button',
    disabled: false,
  },
)
</script>

<template>
  <!-- aria-label falls through from parent onto the native button -->
  <button
    :type="type"
    :class="[styles.root, styles[size]]"
    :disabled="disabled"
    :aria-disabled="disabled || undefined"
  >
    <span :class="styles.icon">
      <slot />
    </span>
  </button>
</template>
