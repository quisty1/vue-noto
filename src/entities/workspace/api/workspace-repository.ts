import type { NotoDatabase, WorkspaceRecord } from '@shared/lib/db'
import { db as defaultDb } from '@shared/lib/db'
import { createId } from '@shared/lib/id'

import { CreateWorkspaceInputSchema } from '../model/schema'
import type { CreateWorkspaceInput, UpdateWorkspaceInput, Workspace } from '../model/types'

function nowIso(): string {
  return new Date().toISOString()
}

function toWorkspace(record: WorkspaceRecord): Workspace {
  return { ...record }
}

export interface WorkspaceRepository {
  getById(id: string): Promise<Workspace | null>
  list(): Promise<Workspace[]>
  create(input: CreateWorkspaceInput): Promise<Workspace>
  update(id: string, patch: UpdateWorkspaceInput): Promise<Workspace>
  delete(id: string): Promise<void>
}

export class DexieWorkspaceRepository implements WorkspaceRepository {
  private readonly database: NotoDatabase

  constructor(database: NotoDatabase = defaultDb) {
    this.database = database
  }

  async getById(id: string): Promise<Workspace | null> {
    const record = await this.database.workspaces.get(id)
    return record ? toWorkspace(record) : null
  }

  async list(): Promise<Workspace[]> {
    const records = await this.database.workspaces.toArray()
    return records.map(toWorkspace).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  async create(input: CreateWorkspaceInput): Promise<Workspace> {
    const parsed = CreateWorkspaceInputSchema.parse(input)
    const timestamp = nowIso()
    const record: WorkspaceRecord = {
      id: createId(),
      name: parsed.name,
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    await this.database.workspaces.add(record)
    return toWorkspace(record)
  }

  async update(id: string, patch: UpdateWorkspaceInput): Promise<Workspace> {
    const existing = await this.database.workspaces.get(id)
    if (!existing) {
      throw new Error(`Workspace ${id} not found`)
    }

    const updated: WorkspaceRecord = {
      ...existing,
      ...patch,
      id: existing.id,
      updatedAt: nowIso(),
    }

    await this.database.workspaces.put(updated)
    return toWorkspace(updated)
  }

  async delete(id: string): Promise<void> {
    await this.database.transaction(
      'rw',
      this.database.workspaces,
      this.database.pages,
      this.database.snapshots,
      async () => {
        const pageIds = await this.database.pages.where('workspaceId').equals(id).primaryKeys()

        for (const pageId of pageIds) {
          await this.database.snapshots.where('pageId').equals(pageId).delete()
        }

        await this.database.pages.where('workspaceId').equals(id).delete()
        await this.database.workspaces.delete(id)
      },
    )
  }
}

export const workspaceRepository = new DexieWorkspaceRepository()
