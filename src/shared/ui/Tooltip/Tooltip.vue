<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'

import styles from './Tooltip.module.scss'

const props = withDefaults(
  defineProps<{
    content: string
    delay?: number
    disabled?: boolean
  }>(),
  {
    delay: 200,
    disabled: false,
  },
)

const visible = ref(false)
let showTimer: ReturnType<typeof setTimeout> | null = null

function clearTimer(): void {
  if (showTimer !== null) {
    clearTimeout(showTimer)
    showTimer = null
  }
}

function show(): void {
  if (props.disabled || !props.content) return
  clearTimer()
  showTimer = setTimeout(() => {
    visible.value = true
  }, props.delay)
}

function hide(): void {
  clearTimer()
  visible.value = false
}

onBeforeUnmount(() => {
  clearTimer()
})
</script>

<template>
  <span :class="styles.root" @mouseenter="show" @mouseleave="hide" @focusin="show" @focusout="hide">
    <slot />
    <span v-if="visible" :class="styles.tooltip" role="tooltip">
      {{ content }}
    </span>
  </span>
</template>
