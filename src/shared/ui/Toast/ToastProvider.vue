<script setup lang="ts">
import { createId } from '@shared/lib/id'
import { onBeforeUnmount, provide, ref, type Ref } from 'vue'

import { TOAST_API_KEY, type ToastApi, type ToastInput, type ToastRecord } from './types'

const DEFAULT_DURATION_MS = 4000

const toasts: Ref<ToastRecord[]> = ref([])
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function clearTimer(id: string): void {
  const timer = timers.get(id)
  if (timer !== undefined) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

function dismiss(id: string): void {
  clearTimer(id)
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function scheduleDismiss(toast: ToastRecord): void {
  if (toast.durationMs <= 0) return
  clearTimer(toast.id)
  const timer = setTimeout(() => {
    dismiss(toast.id)
  }, toast.durationMs)
  timers.set(toast.id, timer)
}

function push(input: ToastInput): string {
  const toast: ToastRecord = {
    id: createId(),
    title: input.title,
    description: input.description,
    tone: input.tone ?? 'default',
    durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
  }
  toasts.value = [...toasts.value, toast]
  scheduleDismiss(toast)
  return toast.id
}

function clear(): void {
  for (const id of [...timers.keys()]) {
    clearTimer(id)
  }
  toasts.value = []
}

const api: ToastApi = {
  push,
  dismiss,
  clear,
  toasts,
}

provide(TOAST_API_KEY, api)

onBeforeUnmount(() => {
  clear()
})

defineExpose({
  push,
  dismiss,
  clear,
})
</script>

<template>
  <slot />
</template>
