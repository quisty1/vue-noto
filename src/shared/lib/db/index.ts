import Dexie, { type EntityTable } from 'dexie'

import type { MetaRecord, PageRecord, SnapshotRecord, WorkspaceRecord } from './schema'

export type {
  JSONContent,
  JSONDoc,
  JSONMark,
  MetaRecord,
  PageRecord,
  SnapshotRecord,
  WorkspaceRecord,
} from './schema'

/**
 * IndexedDB schema for Noto
 * Migrations: bump version() and chain upgrade() handlers as needed
 */
export class NotoDatabase extends Dexie {
  workspaces!: EntityTable<WorkspaceRecord, 'id'>
  pages!: EntityTable<PageRecord, 'id'>
  snapshots!: EntityTable<SnapshotRecord, 'id'>
  meta!: EntityTable<MetaRecord, 'key'>

  constructor(name = 'noto') {
    super(name)

    this.version(1).stores({
      workspaces: 'id, name, createdAt, updatedAt',
      pages:
        'id, workspaceId, parentId, title, icon, cover, content, plainText, isFavorite, isDeleted, deletedAt, createdAt, updatedAt, sortOrder, isCollapsed',
      snapshots: 'id, pageId, content, createdAt, label',
      meta: 'key, value',
    })
  }
}

/** Default singleton used by repositories across the app */
export const db = new NotoDatabase()
