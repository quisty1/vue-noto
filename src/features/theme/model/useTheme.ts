import { STORAGE_KEYS } from '@shared/config'
import { getStorageItem, setStorageItem } from '@shared/lib/storage'
import type { ThemeMode } from '@shared/types'
import { useMediaQuery } from '@vueuse/core'
import { computed, ref, watch } from 'vue'

function resolveTheme(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light'
  }
  return mode
}

function applyTheme(resolved: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', resolved)
  document.documentElement.style.colorScheme = resolved
}

const themeMode = ref<ThemeMode>(getStorageItem<ThemeMode>(STORAGE_KEYS.theme, 'system'))

export function useTheme() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  const resolvedTheme = computed(() => resolveTheme(themeMode.value, prefersDark.value))

  function setTheme(mode: ThemeMode): void {
    themeMode.value = mode
    setStorageItem(STORAGE_KEYS.theme, mode)
    applyTheme(resolveTheme(mode, prefersDark.value))
  }

  watch(
    [themeMode, prefersDark],
    () => {
      applyTheme(resolvedTheme.value)
    },
    { immediate: true },
  )

  return {
    themeMode,
    resolvedTheme,
    setTheme,
  }
}
