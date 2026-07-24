<script setup lang="ts">
import { ChevronDown, ChevronRight, Star } from '@lucide/vue'
import type { PageTreeNode } from '@entities/page'
import { VueDraggable } from 'vue-draggable-plus'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Dropdown, IconButton, type DropdownItem } from '@shared/ui'

import { usePageMutations } from '../model/usePageMutations'
import styles from './PageTreeItem.module.scss'

const props = defineProps<{
  node: PageTreeNode
  workspaceId: string
  activePageId?: string | undefined
  depth: number
}>()

const emit = defineEmits<{
  select: [pageId: string]
  reorder: [parentId: string, orderedIds: string[]]
  move: [pageId: string, newParentId: string | null, index: number]
}>()

const { t } = useI18n()
const { toggleFavorite, toggleCollapse, duplicatePage, deletePage } = usePageMutations(
  () => props.workspaceId,
)

const isActive = computed(() => props.node.id === props.activePageId)
const hasChildren = computed(() => props.node.children.length > 0)

const menuItems = computed<DropdownItem[]>(() => [
  { id: 'favorite', label: t('page.toggleFavorite') },
  { id: 'duplicate', label: t('page.duplicate') },
  { id: 'delete', label: t('page.delete'), danger: true },
])

const childNodes = computed({
  get: () => props.node.children,
  set: (next: PageTreeNode[]) => {
    emit(
      'reorder',
      props.node.id,
      next.map((n) => n.id),
    )
  },
})

function onSelect(): void {
  emit('select', props.node.id)
}

async function onMenuSelect(item: DropdownItem): Promise<void> {
  switch (item.id) {
    case 'favorite':
      await toggleFavorite(props.node)
      break
    case 'duplicate':
      await duplicatePage(props.node.id)
      break
    case 'delete':
      await deletePage(props.node.id)
      break
    default:
      break
  }
}

async function onToggleCollapse(event: Event): Promise<void> {
  event.stopPropagation()
  if (!hasChildren.value) return
  await toggleCollapse(props.node)
}
</script>

<template>
  <li
    role="treeitem"
    :class="styles.item"
    :aria-expanded="hasChildren ? !node.isCollapsed : undefined"
  >
    <div
      :class="[styles.row, isActive ? styles.rowActive : null]"
      :style="{ paddingInlineStart: `calc(var(--noto-space-2) + ${depth} * var(--noto-space-4))` }"
      data-testid="sidebar-page-item"
      :data-page-id="node.id"
      @click="onSelect"
      @contextmenu.prevent
    >
      <button
        v-if="hasChildren"
        type="button"
        :class="styles.collapseBtn"
        :aria-label="node.isCollapsed ? t('page.expand') : t('page.collapse')"
        @click="onToggleCollapse"
      >
        <ChevronRight v-if="node.isCollapsed" :size="14" />
        <ChevronDown v-else :size="14" />
      </button>
      <span v-else :class="styles.collapseSpacer" aria-hidden="true" />

      <span v-if="node.icon" :class="styles.icon" aria-hidden="true">
        {{ node.icon }}
      </span>

      <span :class="styles.title">{{ node.title }}</span>

      <Star
        v-if="node.isFavorite"
        :class="styles.favorite"
        :size="12"
        fill="currentColor"
        aria-hidden="true"
      />

      <Dropdown :items="menuItems" align="end" @select="onMenuSelect">
        <template #trigger="{ toggle }">
          <IconButton
            :class="styles.menuBtn"
            :aria-label="t('page.moreActions')"
            size="sm"
            @click.stop="toggle"
          >
            <span :class="styles.dots">⋯</span>
          </IconButton>
        </template>
      </Dropdown>
    </div>

    <VueDraggable
      v-if="hasChildren && !node.isCollapsed"
      v-model="childNodes"
      :class="styles.children"
      tag="ul"
      role="group"
      :group="{ name: 'pages', pull: true, put: true }"
      item-key="id"
      :animation="150"
      ghost-class="page-tree-ghost"
    >
      <PageTreeItem
        v-for="child in childNodes"
        :key="child.id"
        :node="child"
        :workspace-id="workspaceId"
        :active-page-id="activePageId"
        :depth="depth + 1"
        @select="emit('select', $event)"
        @reorder="(parentId, ids) => emit('reorder', parentId, ids)"
        @move="(id, parentId, index) => emit('move', id, parentId, index)"
      />
    </VueDraggable>
  </li>
</template>
