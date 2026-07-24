import { pageRepository, type Page } from '@entities/page'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

import { pagesQueryKey } from '@features/page-tree'

export function useFavorites(workspaceId: MaybeRefOrGetter<string | undefined>) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: computed(() => {
      const id = toValue(workspaceId)
      return id ? ['favorites', id] : ['favorites', 'none']
    }),
    queryFn: async (): Promise<Page[]> => {
      const id = toValue(workspaceId)
      if (!id) return []
      return pageRepository.listFavorites(id)
    },
    enabled: computed(() => Boolean(toValue(workspaceId))),
  })

  function invalidate(): void {
    const id = toValue(workspaceId)
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ['favorites', id] })
      void queryClient.invalidateQueries({ queryKey: pagesQueryKey(id) })
    }
  }

  return {
    favorites: computed(() => query.data.value ?? []),
    isLoading: query.isLoading,
    invalidate,
  }
}
