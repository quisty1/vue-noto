import { snapshotRepository, type Snapshot } from '@entities/snapshot'
import type { JSONDoc } from '@entities/page'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, ref, type MaybeRefOrGetter, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToast } from '@shared/ui'

const SNAPSHOT_EVERY_N_SAVES = 5
const MIN_CONTENT_DELTA = 200

export function useSnapshots(pageId: MaybeRefOrGetter<string | undefined>) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()
  const saveCounter = ref(0)
  const lastSnapshotLength = ref(0)

  const query = useQuery({
    queryKey: computed(() => {
      const id = toValue(pageId)
      return id ? ['snapshots', id] : ['snapshots', 'none']
    }),
    queryFn: async (): Promise<Snapshot[]> => {
      const id = toValue(pageId)
      if (!id) return []
      return snapshotRepository.listByPage(id)
    },
    enabled: computed(() => Boolean(toValue(pageId))),
  })

  function invalidate(): void {
    const id = toValue(pageId)
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['snapshots', id] })
    }
  }

  const createMutation = useMutation({
    mutationFn: (content: JSONDoc) => {
      const id = toValue(pageId)
      if (!id) throw new Error('No page')
      return snapshotRepository.create({ pageId: id, content })
    },
    onSuccess: () => invalidate(),
  })

  const restoreMutation = useMutation({
    mutationFn: async (snapshotId: string) => {
      const snapshot = await snapshotRepository.getById(snapshotId)
      if (!snapshot) throw new Error('Snapshot not found')
      return snapshot
    },
    onSuccess: () => {
      toast.push({ title: t('snapshots.restored'), tone: 'success' })
    },
  })

  async function maybeCreateSnapshot(content: JSONDoc, plainText: string): Promise<void> {
    saveCounter.value += 1
    const lengthDelta = Math.abs(plainText.length - lastSnapshotLength.value)

    if (saveCounter.value % SNAPSHOT_EVERY_N_SAVES === 0 || lengthDelta >= MIN_CONTENT_DELTA) {
      await createMutation.mutateAsync(content)
      lastSnapshotLength.value = plainText.length
    }
  }

  return {
    snapshots: computed(() => query.data.value ?? []),
    isLoading: query.isLoading,
    createSnapshot: createMutation.mutateAsync,
    restoreSnapshot: restoreMutation.mutateAsync,
    maybeCreateSnapshot,
  }
}
