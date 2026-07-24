import { movePage, pageRepository, type Page, type UpdatePageInput } from '@entities/page'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useI18n } from 'vue-i18n'

import { useToast } from '@shared/ui'

import { pagesQueryKey } from './usePagesQuery'

export function usePageMutations(workspaceId: MaybeRefOrGetter<string | undefined>) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { t } = useI18n()

  const wsId = computed(() => toValue(workspaceId) ?? '')

  function invalidate(): void {
    const id = wsId.value
    if (!id) return
    void queryClient.invalidateQueries({
      queryKey: pagesQueryKey(id),
    })
    void queryClient.invalidateQueries({ queryKey: ['favorites', id] })
    void queryClient.invalidateQueries({ queryKey: ['trash', id] })
  }

  const createMutation = useMutation({
    mutationFn: (input: { title?: string; parentId?: string | null }) => {
      const id = wsId.value
      if (!id) throw new Error('No workspace')
      return pageRepository.create({
        workspaceId: id,
        title: input.title,
        parentId: input.parentId ?? null,
      })
    },
    onSuccess: () => {
      invalidate()
      toast.push({ title: t('page.created'), tone: 'success' })
    },
    onError: () => {
      toast.push({ title: t('page.createError'), tone: 'danger' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdatePageInput }) =>
      pageRepository.update(id, patch),
    onSuccess: () => invalidate(),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => pageRepository.softDelete(id),
    onSuccess: () => {
      invalidate()
      toast.push({ title: t('page.deleted'), tone: 'default' })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const source = await pageRepository.getById(id)
      if (!source) throw new Error('Page not found')
      const workspace = wsId.value
      if (!workspace) throw new Error('No workspace')
      return pageRepository.create({
        workspaceId: workspace,
        parentId: source.parentId,
        title: `${source.title} (${t('page.copy')})`,
        icon: source.icon,
        cover: source.cover,
        content: source.content,
        plainText: source.plainText,
      })
    },
    onSuccess: () => {
      invalidate()
      toast.push({ title: t('page.duplicated'), tone: 'success' })
    },
  })

  const reorderMutation = useMutation({
    mutationFn: async ({
      parentId,
      orderedIds,
    }: {
      parentId: string | null
      orderedIds: string[]
    }) => {
      const id = wsId.value
      if (!id) throw new Error('No workspace')
      return pageRepository.reorder(id, parentId, orderedIds)
    },
    onSuccess: () => invalidate(),
  })

  const moveMutation = useMutation({
    mutationFn: async ({
      pageId,
      newParentId,
      index,
    }: {
      pageId: string
      newParentId: string | null
      index: number
    }) => {
      const id = wsId.value
      if (!id) throw new Error('No workspace')
      const pages = await pageRepository.listByWorkspace(id)
      const updated = movePage(pages, pageId, newParentId, index)
      const moved = updated.find((p) => p.id === pageId)
      if (!moved) throw new Error('Move failed')

      await pageRepository.update(pageId, {
        parentId: newParentId,
        sortOrder: moved.sortOrder,
      })

      const siblings = updated
        .filter((p) => p.parentId === newParentId && !p.isDeleted)
        .sort((a, b) => a.sortOrder - b.sortOrder)

      await pageRepository.reorder(
        id,
        newParentId,
        siblings.map((p) => p.id),
      )
    },
    onSuccess: () => invalidate(),
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (page: Page) =>
      pageRepository.update(page.id, { isFavorite: !page.isFavorite }),
    onSuccess: () => invalidate(),
  })

  const toggleCollapseMutation = useMutation({
    mutationFn: async (page: Page) =>
      pageRepository.update(page.id, { isCollapsed: !page.isCollapsed }),
    onSuccess: () => invalidate(),
  })

  return {
    createPage: createMutation.mutateAsync,
    updatePage: updateMutation.mutateAsync,
    deletePage: deleteMutation.mutateAsync,
    duplicatePage: duplicateMutation.mutateAsync,
    reorderPages: reorderMutation.mutateAsync,
    movePage: moveMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    toggleCollapse: toggleCollapseMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
