import { STORAGE_KEYS } from '@shared/config'
import { getStorageItem, setStorageItem } from '@shared/lib/storage'
import type { Locale } from '@shared/types'
import { ref, watch } from 'vue'

const locale = ref<Locale>(getStorageItem<Locale>(STORAGE_KEYS.locale, 'en'))

type I18nLike = {
  global: {
    locale: { value: string }
  }
}

let i18nInstance: I18nLike | null = null

export function bindI18n(i18n: I18nLike): void {
  i18nInstance = i18n
  i18n.global.locale.value = locale.value
}

export function useLocale() {
  function setLocale(next: Locale): void {
    locale.value = next
    setStorageItem(STORAGE_KEYS.locale, next)
    if (i18nInstance) {
      i18nInstance.global.locale.value = next
    }
    document.documentElement.lang = next
  }

  watch(
    locale,
    (value) => {
      document.documentElement.lang = value
    },
    { immediate: true },
  )

  return {
    locale,
    setLocale,
  }
}
