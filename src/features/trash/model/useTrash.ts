import { pageRepository, type Page } from '@entities/page'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToast } from '@shared/ui'

import { pagesQueryKey } from '@features/page-tree'

export function useTrash(workspaceId: MaybeRefOrGetter<string | undefined>) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  const query = useQuery({
    queryKey: computed(() => {
      const id = toValue(workspaceId)
      return id ? ['trash', id] : ['trash', 'none']
    }),
    queryFn: async (): Promise<Page[]> => {
      const id = toValue(workspaceId)
      if (!id) return []
      const pages = await pageRepository.listByWorkspace(id, {
        includeDeleted: true,
      })
      return pages
        .filter((p) => p.isDeleted)
        .sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? ''))
    },
    enabled: computed(() => Boolean(toValue(workspaceId))),
  })

  function invalidate(): void {
    const id = toValue(workspaceId)
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['trash', id] })
      void queryClient.invalidateQueries({ queryKey: pagesQueryKey(id) })
    }
  }

  const restoreMutation = useMutation({
    mutationFn: (pageId: string) => pageRepository.restore(pageId),
    onSuccess: () => {
      invalidate()
      toast.push({ title: t('trash.restored'), tone: 'success' })
    },
  })

  const purgeMutation = useMutation({
    mutationFn: (pageId: string) => pageRepository.purge(pageId),
    onSuccess: () => {
      invalidate()
      toast.push({ title: t('trash.purged'), tone: 'default' })
    },
  })

  return {
    deletedPages: computed(() => query.data.value ?? []),
    isLoading: query.isLoading,
    restore: restoreMutation.mutateAsync,
    purge: purgeMutation.mutateAsync,
    isRestoring: restoreMutation.isPending,
    isPurging: purgeMutation.isPending,
  }
}
