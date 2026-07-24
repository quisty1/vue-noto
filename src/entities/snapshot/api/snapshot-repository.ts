import type { NotoDatabase, SnapshotRecord } from '@shared/lib/db'
import { db as defaultDb } from '@shared/lib/db'
import { createId } from '@shared/lib/id'

import { CreateSnapshotInputSchema } from '../model/schema'
import type { CreateSnapshotInput, Snapshot } from '../model/types'

/** Soft cap of retained versions per page */
export const MAX_SNAPSHOTS_PER_PAGE = 20

function nowIso(): string {
  return new Date().toISOString()
}

function toSnapshot(record: SnapshotRecord): Snapshot {
  return { ...record }
}

export interface SnapshotRepository {
  create(input: CreateSnapshotInput): Promise<Snapshot>
  listByPage(pageId: string): Promise<Snapshot[]>
  getById(id: string): Promise<Snapshot | null>
  delete(id: string): Promise<void>
}

export class DexieSnapshotRepository implements SnapshotRepository {
  private readonly database: NotoDatabase

  constructor(database: NotoDatabase = defaultDb) {
    this.database = database
  }

  async create(input: CreateSnapshotInput): Promise<Snapshot> {
    const parsed = CreateSnapshotInputSchema.parse(input)

    const record: SnapshotRecord = {
      id: createId(),
      pageId: parsed.pageId,
      content: parsed.content as Snapshot['content'],
      createdAt: nowIso(),
      label: parsed.label ?? null,
    }

    await this.database.transaction('rw', this.database.snapshots, async () => {
      await this.database.snapshots.add(record)

      const existing = await this.database.snapshots
        .where('pageId')
        .equals(parsed.pageId)
        .sortBy('createdAt')

      const overflow = existing.length - MAX_SNAPSHOTS_PER_PAGE
      if (overflow > 0) {
        const toRemove = existing.slice(0, overflow)
        await this.database.snapshots.bulkDelete(toRemove.map((s) => s.id))
      }
    })

    return toSnapshot(record)
  }

  async listByPage(pageId: string): Promise<Snapshot[]> {
    const records = await this.database.snapshots.where('pageId').equals(pageId).sortBy('createdAt')

    return records.reverse().map(toSnapshot)
  }

  async getById(id: string): Promise<Snapshot | null> {
    const record = await this.database.snapshots.get(id)
    return record ? toSnapshot(record) : null
  }

  async delete(id: string): Promise<void> {
    await this.database.snapshots.delete(id)
  }
}

export const snapshotRepository = new DexieSnapshotRepository()
