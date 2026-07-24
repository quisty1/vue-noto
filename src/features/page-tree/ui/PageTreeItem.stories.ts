import type { Meta, StoryObj } from '@storybook/vue3-vite'

import PageTreeItem from './PageTreeItem.vue'
import type { PageTreeNode } from '@entities/page'

const sampleNode: PageTreeNode = {
  id: 'page-1',
  workspaceId: 'ws-1',
  parentId: null,
  title: 'Getting Started',
  icon: '🚀',
  cover: null,
  content: { type: 'doc', content: [{ type: 'paragraph' }] },
  plainText: 'Welcome',
  isFavorite: true,
  isDeleted: false,
  deletedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  sortOrder: 0,
  isCollapsed: false,
  children: [
    {
      id: 'page-2',
      workspaceId: 'ws-1',
      parentId: 'page-1',
      title: 'Nested page',
      icon: null,
      cover: null,
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      plainText: 'Nested',
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      sortOrder: 0,
      isCollapsed: false,
      children: [],
    },
  ],
}

const meta: Meta<typeof PageTreeItem> = {
  title: 'Features/PageTreeItem',
  component: PageTreeItem,
  tags: ['autodocs'],
  args: {
    node: sampleNode,
    workspaceId: 'ws-1',
    depth: 0,
  },
}

export default meta
type Story = StoryObj<typeof PageTreeItem>

export const Default: Story = {}

export const Active: Story = {
  args: {
    activePageId: 'page-1',
  },
}

export const Collapsed: Story = {
  args: {
    node: { ...sampleNode, isCollapsed: true },
  },
}
