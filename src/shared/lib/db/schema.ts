/**
 * IndexedDB record shapes and TipTap JSON node types
 */
import type { Table } from 'dexie'

/** TipTap document stored as JSON */
export type JSONDoc = {
  type: 'doc'
  content?: JSONContent[]
  [key: string]: unknown
}

/** Single TipTap / ProseMirror JSON node */
export type JSONContent = {
  type: string
  attrs?: Record<string, unknown>
  content?: JSONContent[]
  marks?: JSONMark[]
  text?: string
  [key: string]: unknown
}

export type JSONMark = {
  type: string
  attrs?: Record<string, unknown>
  [key: string]: unknown
}

export interface WorkspaceRecord {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

/** Page tree node; soft-delete via isDeleted / deletedAt */
export interface PageRecord {
  id: string
  workspaceId: string
  parentId: string | null
  title: string
  icon: string | null
  cover: string | null
  content: JSONDoc
  /** Denormalized text for search indexing */
  plainText: string
  isFavorite: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
  sortOrder: number
  isCollapsed: boolean
}

/** Point-in-time content snapshot for a page */
export interface SnapshotRecord {
  id: string
  pageId: string
  content: JSONDoc
  createdAt: string
  label: string | null
}

/** Key-value bag for app flags (onboarding, etc.) */
export interface MetaRecord {
  key: string
  value: unknown
}

export type WorkspacesTable = Table<WorkspaceRecord, string>
export type PagesTable = Table<PageRecord, string>
export type SnapshotsTable = Table<SnapshotRecord, string>
export type MetaTable = Table<MetaRecord, string>
