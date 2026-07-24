<script setup lang="ts">
import { X } from '@lucide/vue'
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

import { IconButton } from '../IconButton'
import styles from './Dialog.module.scss'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    wide?: boolean
    closeOnOverlay?: boolean
    showClose?: boolean
    ariaLabel?: string
  }>(),
  {
    wide: false,
    closeOnOverlay: true,
    showClose: true,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  close: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const uid = useId()
const titleId = `${uid}-title`
const descriptionId = `${uid}-desc`
let previousFocus: HTMLElement | null = null

function close(): void {
  emit('update:open', false)
  emit('close')
}

function getFocusableElements(): HTMLElement[] {
  if (!dialogRef.value) return []
  return Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true',
  )
}

function focusInitial(): void {
  const focusable = getFocusableElements()
  const target = focusable[0] ?? dialogRef.value
  target?.focus()
}

function onKeydown(event: KeyboardEvent): void {
  if (!props.open) return

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab' || !dialogRef.value) return

  const focusable = getFocusableElements()
  if (focusable.length === 0) {
    event.preventDefault()
    dialogRef.value.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (!first || !last) return

  const active = document.activeElement as HTMLElement | null

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

function onOverlayClick(event: MouseEvent): void {
  if (!props.closeOnOverlay) return
  if (event.target === event.currentTarget) {
    close()
  }
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previousFocus = document.activeElement as HTMLElement | null
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      focusInitial()
      return
    }

    document.removeEventListener('keydown', onKeydown)
    await nextTick()
    previousFocus?.focus?.()
    previousFocus = null
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="open" :class="styles.overlay" @mousedown="onOverlayClick">
      <div
        ref="dialogRef"
        :class="[styles.dialog, wide ? styles.dialogWide : null]"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        :aria-describedby="description ? descriptionId : undefined"
        :aria-label="!title ? ariaLabel : undefined"
        tabindex="-1"
      >
        <div v-if="title || showClose || $slots.header" :class="styles.header">
          <slot name="header">
            <h2 v-if="title" :id="titleId" :class="styles.title">
              {{ title }}
            </h2>
          </slot>
          <IconButton
            v-if="showClose"
            :class="styles.close"
            aria-label="Close dialog"
            size="sm"
            @click="close"
          >
            <X :size="16" />
          </IconButton>
        </div>

        <p v-if="description" :id="descriptionId" :class="styles.description">
          {{ description }}
        </p>

        <div :class="styles.body">
          <slot />
        </div>

        <div v-if="$slots.footer" :class="styles.footer">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
