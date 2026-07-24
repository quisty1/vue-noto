import { buildTree, pageRepository, type Page, type PageTreeNode } from '@entities/page'
import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'

export const PAGES_QUERY_KEY = 'pages'

export function pagesQueryKey(workspaceId: string) {
  return [PAGES_QUERY_KEY, workspaceId] as const
}

export function usePagesQuery(workspaceId: MaybeRefOrGetter<string | undefined>) {
  const query = useQuery({
    queryKey: computed(() => {
      const id = toValue(workspaceId)
      return id ? pagesQueryKey(id) : [PAGES_QUERY_KEY, 'none']
    }),
    queryFn: async (): Promise<Page[]> => {
      const id = toValue(workspaceId)
      if (!id) return []
      return pageRepository.listByWorkspace(id)
    },
    enabled: computed(() => Boolean(toValue(workspaceId))),
  })

  const tree = computed<PageTreeNode[]>(() => buildTree(query.data.value ?? []))

  return {
    ...query,
    tree,
    pages: computed(() => query.data.value ?? []),
  }
}
