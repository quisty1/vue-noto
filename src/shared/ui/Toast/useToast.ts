import { inject } from 'vue'

import { TOAST_API_KEY, type ToastApi } from './types'

export function useToast(): ToastApi {
  const api = inject(TOAST_API_KEY, null)
  if (!api) {
    throw new Error('useToast() requires <ToastProvider> in the ancestor tree')
  }
  return api
}
