import { pageRepository, type Page } from '@entities/page'
import { useQuery } from '@tanstack/vue-query'
import { computed, ref, type MaybeRefOrGetter, toValue } from 'vue'

import { getHighlightSegments } from './highlight'

export { getHighlightSegments } from './highlight'
export type { HighlightSegment } from './highlight'

export function useSearch(workspaceId: MaybeRefOrGetter<string | undefined>) {
  const query = ref('')

  const searchQuery = useQuery({
    queryKey: computed(() => {
      const id = toValue(workspaceId)
      const q = query.value.trim()
      return ['search', id, q]
    }),
    queryFn: async (): Promise<Page[]> => {
      const id = toValue(workspaceId)
      const q = query.value.trim()
      if (!id || !q) return []
      return pageRepository.search(id, q)
    },
    enabled: computed(() => {
      const id = toValue(workspaceId)
      return Boolean(id && query.value.trim().length > 0)
    }),
  })

  return {
    query,
    results: computed(() => searchQuery.data.value ?? []),
    isSearching: searchQuery.isFetching,
    getHighlightSegments,
  }
}
