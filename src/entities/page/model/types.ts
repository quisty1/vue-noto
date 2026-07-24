import type { JSONContent, JSONDoc } from '@shared/lib/db'

export type { JSONContent, JSONDoc }

export interface Page {
  id: string
  workspaceId: string
  parentId: string | null
  title: string
  icon: string | null
  cover: string | null
  content: JSONDoc
  plainText: string
  isFavorite: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  sortOrder: number
  isCollapsed: boolean
}

export type PageTreeNode = Page & {
  children: PageTreeNode[]
}

export type CreatePageInput = {
  workspaceId: string
  parentId?: string | null
  title?: string
  icon?: string | null
  cover?: string | null
  content?: JSONDoc
  plainText?: string
  isFavorite?: boolean
  sortOrder?: number
  isCollapsed?: boolean
}

export type UpdatePageInput = Partial<
  Pick<
    Page,
    | 'title'
    | 'icon'
    | 'cover'
    | 'content'
    | 'plainText'
    | 'isFavorite'
    | 'parentId'
    | 'sortOrder'
    | 'isCollapsed'
  >
>

export const EMPTY_DOC: JSONDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}
