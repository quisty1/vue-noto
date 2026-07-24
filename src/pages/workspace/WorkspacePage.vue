<script setup lang="ts">
import { Menu } from '@lucide/vue'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'

import { EmptyState, IconButton } from '@shared/ui'
import { STORAGE_KEYS } from '@shared/config'
import { getStorageItem, setStorageItem } from '@shared/lib/storage'
import { workspaceRepository } from '@entities/workspace'
import { pageRepository, type JSONDoc, type UpdatePageInput } from '@entities/page'

import { usePagesQuery, usePageMutations } from '@features/page-tree'
import { useUiStore } from '@features/workspace-session'
import type { AutosaveStatus } from '@features/editor'
import { AppSidebar } from '@widgets/app-sidebar'
import { AppHeader } from '@widgets/app-header'
import { EditorWorkspace } from '@widgets/editor-workspace'
import { CommandPaletteHost } from '@widgets/command-palette-host'
import styles from './WorkspacePage.module.scss'

const props = defineProps<{
  workspaceId?: string
  pageId?: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()

const resolvedWorkspaceId = computed(() => {
  const fromRoute = props.workspaceId ?? (route.params.workspaceId as string | undefined)
  if (fromRoute) return fromRoute
  return getStorageItem<string | null>(STORAGE_KEYS.lastWorkspaceId, null) ?? undefined
})

const workspaceQuery = useQuery({
  queryKey: computed(() => ['workspace', resolvedWorkspaceId.value]),
  queryFn: async () => {
    const id = resolvedWorkspaceId.value
    if (!id) {
      const list = await workspaceRepository.list()
      return list[0] ?? null
    }
    return workspaceRepository.getById(id)
  },
})

const workspace = computed(() => workspaceQuery.data.value)

watch(workspace, (ws) => {
  if (ws) {
    setStorageItem(STORAGE_KEYS.lastWorkspaceId, ws.id)
  }
})

const workspaceIdRef = computed(() => workspace.value?.id)

const { pages } = usePagesQuery(() => workspaceIdRef.value || undefined)

const { updatePage, toggleFavorite, duplicatePage, deletePage } = usePageMutations(
  () => workspaceIdRef.value,
)

const activePageId = computed(() => props.pageId ?? (route.params.pageId as string | undefined))

const currentPageQuery = useQuery({
  queryKey: computed(() => ['page', activePageId.value]),
  queryFn: async () => {
    const id = activePageId.value
    if (!id) return null
    return pageRepository.getById(id)
  },
  enabled: computed(() => Boolean(activePageId.value)),
})

const currentPage = computed(() => currentPageQuery.data.value ?? null)

watch(currentPage, (page) => {
  if (page) {
    uiStore.pushRecentPage(page.id)
  }
})

const saveStatus = ref<AutosaveStatus>('idle')
const editorRef = ref<InstanceType<typeof EditorWorkspace> | null>(null)
const paletteOpen = ref(false)

function onSelectPage(pageId: string): void {
  const wsId = workspace.value?.id
  if (!wsId) return
  void router.push({ name: 'page', params: { workspaceId: wsId, pageId } })
}

async function onPageUpdate(patch: UpdatePageInput): Promise<void> {
  if (!currentPage.value) return
  await updatePage({ id: currentPage.value.id, patch })
  void currentPageQuery.refetch()
}

async function onToggleFavorite(): Promise<void> {
  if (!currentPage.value) return
  await toggleFavorite(currentPage.value)
  void currentPageQuery.refetch()
}

async function onDuplicate(): Promise<void> {
  if (!currentPage.value) return
  const dup = await duplicatePage(currentPage.value.id)
  onSelectPage(dup.id)
}

async function onDelete(): Promise<void> {
  if (!currentPage.value || !workspace.value) return
  await deletePage(currentPage.value.id)
  void router.push({ name: 'workspace', params: { workspaceId: workspace.value.id } })
}

function onRestoreSnapshot(content: JSONDoc): void {
  editorRef.value?.restoreContent(content)
}

function openSearch(): void {
  paletteOpen.value = true
}
</script>

<template>
  <div v-if="workspace" :class="styles.layout">
    <AppSidebar :workspace="workspace" :active-page-id="activePageId" @select-page="onSelectPage" />

    <div :class="styles.main">
      <AppHeader
        :pages="pages"
        :current-page="currentPage"
        :save-status="saveStatus"
        @open-search="openSearch"
        @toggle-favorite="onToggleFavorite"
        @duplicate="onDuplicate"
        @delete="onDelete"
        @restore-snapshot="onRestoreSnapshot"
      >
        <template #menu>
          <IconButton
            :class="styles.menuBtn"
            :aria-label="t('sidebar.openMenu')"
            size="sm"
            @click="uiStore.setSidebarOpen(true)"
          >
            <Menu :size="16" />
          </IconButton>
        </template>
      </AppHeader>

      <EditorWorkspace
        v-if="currentPage"
        ref="editorRef"
        :page="currentPage"
        @update="onPageUpdate"
        @save-status="saveStatus = $event"
      />

      <EmptyState v-else :title="t('page.emptyTitle')" :description="t('page.emptyDescription')" />
    </div>

    <CommandPaletteHost
      v-model:open="paletteOpen"
      :workspace-id="workspace.id"
      @select-page="onSelectPage"
    />
  </div>
</template>
