import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick } from 'vue'

import { EMPTY_DOC } from '@entities/page'

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces save and sets status to saved', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined)
    const docRef = ref(EMPTY_DOC)

    const { useAutosave } = await import('./useAutosave')
    const { status, schedule } = useAutosave(saveFn, docRef, {
      debounceMs: 500,
    })

    schedule()
    expect(status.value).toBe('idle')

    vi.advanceTimersByTime(500)
    await nextTick()
    await vi.runAllTimersAsync()

    expect(saveFn).toHaveBeenCalledTimes(1)
    expect(status.value).toBe('saved')
  })

  it('sets error status when save fails', async () => {
    const saveFn = vi.fn().mockRejectedValue(new Error('fail'))
    const docRef = ref(EMPTY_DOC)

    const { useAutosave } = await import('./useAutosave')
    const { status, flush } = useAutosave(saveFn, docRef)

    await flush()
    expect(status.value).toBe('error')
  })
})
