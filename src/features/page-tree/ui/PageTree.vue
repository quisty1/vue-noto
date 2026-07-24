<script setup lang="ts">
import type { PageTreeNode } from '@entities/page'
import { VueDraggable } from 'vue-draggable-plus'
import { computed } from 'vue'

import PageTreeItem from './PageTreeItem.vue'
import styles from './PageTree.module.scss'

const props = defineProps<{
  nodes: PageTreeNode[]
  workspaceId: string
  activePageId?: string | undefined
  collapsed?: boolean
}>()

const emit = defineEmits<{
  select: [pageId: string]
  reorder: [parentId: string | null, orderedIds: string[]]
  move: [pageId: string, newParentId: string | null, index: number]
}>()

const localNodes = computed({
  get: () => props.nodes,
  set: (next: PageTreeNode[]) => {
    emit(
      'reorder',
      null,
      next.map((n) => n.id),
    )
  },
})

function onChildReorder(parentId: string, orderedIds: string[]): void {
  emit('reorder', parentId, orderedIds)
}

function onChildMove(pageId: string, newParentId: string | null, index: number): void {
  emit('move', pageId, newParentId, index)
}
</script>

<template>
  <VueDraggable
    v-model="localNodes"
    :class="styles.list"
    tag="ul"
    role="tree"
    :group="{ name: 'pages', pull: true, put: true }"
    item-key="id"
    :animation="150"
    ghost-class="page-tree-ghost"
  >
    <PageTreeItem
      v-for="node in localNodes"
      :key="node.id"
      :node="node"
      :workspace-id="workspaceId"
      :active-page-id="activePageId"
      :depth="0"
      :collapsed="collapsed"
      @select="emit('select', $event)"
      @reorder="onChildReorder"
      @move="onChildMove"
    />
  </VueDraggable>
</template>
