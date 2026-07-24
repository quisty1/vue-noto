import type { InjectionKey, Ref } from 'vue'

export type ToastTone = 'default' | 'success' | 'warning' | 'danger' | 'info'

export type ToastInput = {
  title: string
  description?: string
  tone?: ToastTone
  durationMs?: number
}

export type ToastRecord = ToastInput & {
  id: string
  tone: ToastTone
  durationMs: number
}

export type ToastApi = {
  push: (toast: ToastInput) => string
  dismiss: (id: string) => void
  clear: () => void
  toasts: Ref<ToastRecord[]>
}

export const TOAST_API_KEY: InjectionKey<ToastApi> = Symbol('noto-toast-api')
