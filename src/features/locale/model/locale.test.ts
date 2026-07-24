import { describe, expect, it, beforeEach, vi } from 'vitest'

import { STORAGE_KEYS } from '@shared/config'

describe('useLocale', () => {
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
    vi.resetModules()
  })

  it('persists locale to storage', async () => {
    const { useLocale } = await import('./useLocale')
    const { setLocale } = useLocale()

    setLocale('ru')

    expect(localStorage.getItem(STORAGE_KEYS.locale)).toBe('"ru"')
    expect(document.documentElement.lang).toBe('ru')
  })
})
