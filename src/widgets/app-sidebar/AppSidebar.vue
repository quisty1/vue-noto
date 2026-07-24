<script setup lang="ts">
import { FilePlus, PanelLeftClose, PanelLeftOpen, Settings, Star, Trash2 } from '@lucide/vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { Button, IconButton } from '@shared/ui'
import type { Workspace } from '@entities/workspace'
import type { Page } from '@entities/page'

import { PageTree, usePagesQuery, usePageMutations } from '@features/page-tree'
import { useFavorites } from '@features/favorites'
import { useUiStore } from '@features/workspace-session'
import styles from './AppSidebar.module.scss'

const props = defineProps<{
  workspace: Workspace
  activePageId?: string | undefined
}>()

const emit = defineEmits<{
  selectPage: [pageId: string]
}>()

const { t } = useI18n()
const router = useRouter()
const uiStore = useUiStore()

const workspaceId = computed(() => props.workspace.id)
const { tree } = usePagesQuery(() => workspaceId.value)
const { createPage, reorderPages, movePage } = usePageMutations(() => workspaceId.value)
const { favorites } = useFavorites(() => workspaceId.value)

const recentPages = computed(() => {
  return uiStore.recentPageIds
    .map((id) => {
      const find = (nodes: typeof tree.value): Page | undefined => {
        for (const node of nodes) {
          if (node.id === id) return node
          const child = find(node.children)
          if (child) return child
        }
        return undefined
      }
      return find(tree.value)
    })
    .filter((p): p is Page => Boolean(p))
})

async function onNewPage(): Promise<void> {
  const page = await createPage({ title: t('page.untitled') })
  emit('selectPage', page.id)
}

function onSelectPage(pageId: string): void {
  emit('selectPage', pageId)
  if (window.innerWidth < 768) {
    uiStore.setSidebarOpen(false)
  }
}

async function onReorder(parentId: string | null, orderedIds: string[]): Promise<void> {
  await reorderPages({ parentId, orderedIds })
}

async function onMove(pageId: string, newParentId: string | null, index: number): Promise<void> {
  await movePage({ pageId, newParentId, index })
}

function goToTrash(): void {
  void router.push({ name: 'trash', query: { workspaceId: workspaceId.value } })
}

function goToSettings(): void {
  void router.push({ name: 'settings' })
}
</script>

<template>
  <aside
    :class="[
      styles.sidebar,
      uiStore.sidebarCollapsed ? styles.collapsed : null,
      uiStore.sidebarOpen ? styles.open : null,
    ]"
    :aria-label="workspace.name"
  >
    <div :class="styles.header">
      <div :class="styles.brand">
        <span :class="styles.brandMark" aria-hidden="true">N</span>
        <div :class="styles.brandText">
          <span :class="styles.brandWordmark">{{ t('app.name') }}</span>
          <h2 :class="styles.workspaceName">{{ workspace.name }}</h2>
        </div>
      </div>
      <IconButton
        :aria-label="uiStore.sidebarCollapsed ? t('sidebar.expand') : t('sidebar.collapse')"
        size="sm"
        @click="uiStore.toggleSidebarCollapsed"
      >
        <PanelLeftClose v-if="!uiStore.sidebarCollapsed" :size="16" />
        <PanelLeftOpen v-else :size="16" />
      </IconButton>
    </div>

    <div :class="styles.actions">
      <Button
        variant="secondary"
        size="sm"
        data-testid="new-page-button"
        :aria-label="t('sidebar.newPage')"
        @click="onNewPage"
      >
        <template #leading>
          <FilePlus :size="16" />
        </template>
        <span :class="styles.newPageLabel">{{ t('sidebar.newPage') }}</span>
      </Button>
    </div>

    <nav :class="styles.section">
      <h3 :class="styles.sectionTitle">{{ t('sidebar.pages') }}</h3>
      <PageTree
        :nodes="tree"
        :workspace-id="workspaceId"
        :active-page-id="activePageId"
        :collapsed="uiStore.sidebarCollapsed"
        @select="onSelectPage"
        @reorder="onReorder"
        @move="onMove"
      />
    </nav>

    <nav v-if="favorites.length > 0 && !uiStore.sidebarCollapsed" :class="styles.section">
      <h3 :class="styles.sectionTitle">
        <Star :size="12" aria-hidden="true" />
        {{ t('sidebar.favorites') }}
      </h3>
      <ul :class="styles.linkList">
        <li v-for="page in favorites" :key="page.id">
          <button
            type="button"
            :class="[styles.link, page.id === activePageId ? styles.linkActive : null]"
            :aria-label="page.title"
            @click="onSelectPage(page.id)"
          >
            <span v-if="page.icon">{{ page.icon }}</span>
            <span :class="styles.linkLabel">{{ page.title }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <nav v-if="recentPages.length > 0 && !uiStore.sidebarCollapsed" :class="styles.section">
      <h3 :class="styles.sectionTitle">{{ t('sidebar.recent') }}</h3>
      <ul :class="styles.linkList">
        <li v-for="page in recentPages" :key="page.id">
          <button
            type="button"
            :class="[styles.link, page.id === activePageId ? styles.linkActive : null]"
            @click="onSelectPage(page.id)"
          >
            <span :class="styles.linkLabel">{{ page.title }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <div :class="styles.footer">
      <button
        type="button"
        :class="styles.footerLink"
        :aria-label="t('sidebar.trash')"
        @click="goToTrash"
      >
        <Trash2 :size="16" aria-hidden="true" />
        <span :class="styles.footerLabel">{{ t('sidebar.trash') }}</span>
      </button>
      <button
        type="button"
        :class="styles.footerLink"
        :aria-label="t('sidebar.settings')"
        @click="goToSettings"
      >
        <Settings :size="16" aria-hidden="true" />
        <span :class="styles.footerLabel">{{ t('sidebar.settings') }}</span>
      </button>
    </div>
  </aside>

  <div
    v-if="uiStore.sidebarOpen"
    :class="styles.backdrop"
    data-testid="sidebar-backdrop"
    @click="uiStore.setSidebarOpen(false)"
  />
</template>
