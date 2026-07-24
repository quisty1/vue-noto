import type { NotoDatabase, PageRecord } from '@shared/lib/db'
import { db as defaultDb } from '@shared/lib/db'
import { createId } from '@shared/lib/id'

import { CreatePageInputSchema } from '../model/schema'
import type { CreatePageInput, Page, UpdatePageInput } from '../model/types'
import { EMPTY_DOC } from '../model/types'

function nowIso(): string {
  return new Date().toISOString()
}

function toPage(record: PageRecord): Page {
  return { ...record }
}

export interface PageRepository {
  getById(id: string): Promise<Page | null>
  listByWorkspace(workspaceId: string, options?: { includeDeleted?: boolean }): Promise<Page[]>
  create(input: CreatePageInput): Promise<Page>
  update(id: string, patch: UpdatePageInput): Promise<Page>
  softDelete(id: string): Promise<Page>
  restore(id: string): Promise<Page>
  purge(id: string): Promise<void>
  listFavorites(workspaceId: string): Promise<Page[]>
  search(workspaceId: string, query: string): Promise<Page[]>
  reorder(workspaceId: string, parentId: string | null, orderedIds: string[]): Promise<Page[]>
}

export class DexiePageRepository implements PageRepository {
  private readonly database: NotoDatabase

  constructor(database: NotoDatabase = defaultDb) {
    this.database = database
  }

  async getById(id: string): Promise<Page | null> {
    const record = await this.database.pages.get(id)
    return record ? toPage(record) : null
  }

  async listByWorkspace(
    workspaceId: string,
    options: { includeDeleted?: boolean } = {},
  ): Promise<Page[]> {
    const records = await this.database.pages.where('workspaceId').equals(workspaceId).toArray()

    const filtered = options.includeDeleted ? records : records.filter((p) => !p.isDeleted)

    return filtered
      .map(toPage)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt))
  }

  async create(input: CreatePageInput): Promise<Page> {
    const parsed = CreatePageInputSchema.parse(input)
    const timestamp = nowIso()

    const siblings = await this.database.pages
      .where('workspaceId')
      .equals(parsed.workspaceId)
      .filter((p) => p.parentId === (parsed.parentId ?? null) && !p.isDeleted)
      .toArray()

    const maxOrder = siblings.reduce((max, p) => Math.max(max, p.sortOrder), -1)

    const record: PageRecord = {
      id: createId(),
      workspaceId: parsed.workspaceId,
      parentId: parsed.parentId ?? null,
      title: parsed.title ?? 'Untitled',
      icon: parsed.icon ?? null,
      cover: parsed.cover ?? null,
      content: (parsed.content as Page['content']) ?? EMPTY_DOC,
      plainText: parsed.plainText ?? '',
      isFavorite: parsed.isFavorite ?? false,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: parsed.sortOrder ?? maxOrder + 1,
      isCollapsed: parsed.isCollapsed ?? false,
    }

    await this.database.pages.add(record)
    return toPage(record)
  }

  async update(id: string, patch: UpdatePageInput): Promise<Page> {
    const existing = await this.database.pages.get(id)
    if (!existing) {
      throw new Error(`Page ${id} not found`)
    }

    const safePatch = {
      ...patch,
      ...(patch.content !== undefined
        ? { content: JSON.parse(JSON.stringify(patch.content)) as PageRecord['content'] }
        : {}),
    }

    const updated: PageRecord = {
      ...existing,
      ...safePatch,
      id: existing.id,
      workspaceId: existing.workspaceId,
      updatedAt: nowIso(),
    }

    await this.database.pages.put(updated)
    return toPage(updated)
  }

  async softDelete(id: string): Promise<Page> {
    const existing = await this.database.pages.get(id)
    if (!existing) {
      throw new Error(`Page ${id} not found`)
    }

    const updated: PageRecord = {
      ...existing,
      isDeleted: true,
      deletedAt: nowIso(),
      updatedAt: nowIso(),
      isFavorite: false,
    }

    await this.database.pages.put(updated)
    return toPage(updated)
  }

  async restore(id: string): Promise<Page> {
    const existing = await this.database.pages.get(id)
    if (!existing) {
      throw new Error(`Page ${id} not found`)
    }

    const updated: PageRecord = {
      ...existing,
      isDeleted: false,
      deletedAt: null,
      updatedAt: nowIso(),
    }

    await this.database.pages.put(updated)
    return toPage(updated)
  }

  async purge(id: string): Promise<void> {
    await this.database.transaction(
      'rw',
      this.database.pages,
      this.database.snapshots,
      async () => {
        await this.database.snapshots.where('pageId').equals(id).delete()
        await this.database.pages.delete(id)
      },
    )
  }

  async listFavorites(workspaceId: string): Promise<Page[]> {
    const records = await this.database.pages
      .where('workspaceId')
      .equals(workspaceId)
      .filter((p) => p.isFavorite && !p.isDeleted)
      .toArray()

    return records.map(toPage).sort((a, b) => a.title.localeCompare(b.title))
  }

  async search(workspaceId: string, query: string): Promise<Page[]> {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []

    const records = await this.database.pages
      .where('workspaceId')
      .equals(workspaceId)
      .filter((p) => !p.isDeleted)
      .toArray()

    return records
      .filter(
        (p) =>
          p.title.toLowerCase().includes(normalized) ||
          p.plainText.toLowerCase().includes(normalized),
      )
      .map(toPage)
      .sort((a, b) => a.title.localeCompare(b.title))
  }

  async reorder(
    workspaceId: string,
    parentId: string | null,
    orderedIds: string[],
  ): Promise<Page[]> {
    const siblings = await this.database.pages
      .where('workspaceId')
      .equals(workspaceId)
      .filter((p) => p.parentId === parentId && !p.isDeleted)
      .toArray()

    const siblingIds = new Set(siblings.map((p) => p.id))
    if (orderedIds.length !== siblingIds.size || orderedIds.some((id) => !siblingIds.has(id))) {
      throw new Error('orderedIds must match siblings under parent')
    }

    const timestamp = nowIso()
    const updated: Page[] = []

    await this.database.transaction('rw', this.database.pages, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i]!
        const existing = siblings.find((p) => p.id === id)!
        const next: PageRecord = {
          ...existing,
          sortOrder: i,
          updatedAt: timestamp,
        }
        await this.database.pages.put(next)
        updated.push(toPage(next))
      }
    })

    return updated.sort((a, b) => a.sortOrder - b.sortOrder)
  }
}

export const pageRepository = new DexiePageRepository()
