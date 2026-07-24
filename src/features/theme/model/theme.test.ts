import { describe, expect, it, beforeEach, vi } from 'vitest'

import { STORAGE_KEYS } from '@shared/config'

describe('useTheme', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null
      },
      setItem(key: string, value: string) {
        this.store[key] = value
      },
      removeItem(key: string) {
        delete this.store[key]
      },
      clear() {
        this.store = {}
      },
    })
    document.documentElement.removeAttribute('data-theme')
    vi.resetModules()
  })

  it('persists theme mode to storage', async () => {
    const { useTheme } = await import('./useTheme')
    const { setTheme } = useTheme()

    setTheme('dark')

    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe('"dark"')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('applies light theme when mode is light', async () => {
    const { useTheme } = await import('./useTheme')
    const { setTheme } = useTheme()

    setTheme('light')

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })
})
