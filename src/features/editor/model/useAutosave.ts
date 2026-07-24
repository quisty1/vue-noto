import { AUTOSAVE_MS } from '@shared/config'
import type { JSONDoc } from '@entities/page'
import { ref, watch, type Ref } from 'vue'

import { extractPlainText } from '../lib/extractPlainText'

export type AutosaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutosave(
  saveFn: (doc: JSONDoc, plainText: string) => Promise<void>,
  docRef: Ref<JSONDoc | null>,
  options: { debounceMs?: number } = {},
) {
  const debounceMs = options.debounceMs ?? AUTOSAVE_MS
  const status = ref<AutosaveStatus>('idle')
  let timer: ReturnType<typeof setTimeout> | null = null
  let saveCount = 0

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  async function flush(): Promise<void> {
    const doc = docRef.value
    if (!doc) return

    status.value = 'saving'
    saveCount += 1

    try {
      await saveFn(doc, extractPlainText(doc))
      status.value = 'saved'
    } catch {
      status.value = 'error'
    }
  }

  function schedule(): void {
    clearTimer()
    timer = setTimeout(() => {
      void flush()
    }, debounceMs)
  }

  watch(docRef, () => {
    if (docRef.value) {
      schedule()
    }
  })

  function dispose(): void {
    clearTimer()
  }

  return {
    status,
    saveCount,
    schedule,
    flush,
    dispose,
  }
}
