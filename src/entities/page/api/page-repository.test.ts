import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { NotoDatabase, PageRecord } from '@shared/lib/db'

import { DexiePageRepository } from './page-repository'
import { EMPTY_DOC } from '../model/types'

type Store = Map<string, PageRecord>

function createMemoryDb() {
  const pages: Store = new Map()
  const snapshots = new Map<string, { id: string; pageId: string }>()

  const pagesTable = {
    get: vi.fn(async (id: string) => pages.get(id)),
    add: vi.fn(async (record: PageRecord) => {
      pages.set(record.id, record)
      return record.id
    }),
    put: vi.fn(async (record: PageRecord) => {
      pages.set(record.id, record)
      return record.id
    }),
    delete: vi.fn(async (id: string) => {
      pages.delete(id)
    }),
    where: vi.fn((field: 'workspaceId' | 'pageId') => ({
      equals: (value: string) => ({
        toArray: async () => [...pages.values()].filter((p) => p[field as 'workspaceId'] === value),
        filter: (predicate: (p: PageRecord) => boolean) => ({
          toArray: async () =>
            [...pages.values()].filter((p) => p.workspaceId === value && predicate(p)),
        }),
        delete: async () => {
          for (const [id, p] of pages) {
            if (p.workspaceId === value) pages.delete(id)
          }
        },
      }),
    })),
  }

  const snapshotsTable = {
    where: vi.fn(() => ({
      equals: (pageId: string) => ({
        delete: async () => {
          for (const [id, s] of snapshots) {
            if (s.pageId === pageId) snapshots.delete(id)
          }
        },
      }),
    })),
  }

  const database = {
    pages: pagesTable,
    snapshots: snapshotsTable,
    transaction: vi.fn(async (_mode: string, ...rest: unknown[]) => {
      const fn = rest[rest.length - 1] as () => Promise<void>
      await fn()
    }),
  } as unknown as NotoDatabase

  return { database, pages, snapshots, pagesTable }
}

describe('DexiePageRepository (mocked db)', () => {
  let repository: DexiePageRepository
  let pages: Store

  beforeEach(() => {
    const memory = createMemoryDb()
    pages = memory.pages
    repository = new DexiePageRepository(memory.database)
  })

  it('creates a page with defaults', async () => {
    const page = await repository.create({
      workspaceId: 'ws-1',
      title: 'Notes',
    })

    expect(page.title).toBe('Notes')
    expect(page.parentId).toBeNull()
    expect(page.isDeleted).toBe(false)
    expect(page.content).toEqual(EMPTY_DOC)
    expect(pages.get(page.id)?.title).toBe('Notes')
  })

  it('updates, soft-deletes, restores, and purges', async () => {
    const page = await repository.create({ workspaceId: 'ws-1', title: 'A' })

    const updated = await repository.update(page.id, { title: 'B' })
    expect(updated.title).toBe('B')

    const deleted = await repository.softDelete(page.id)
    expect(deleted.isDeleted).toBe(true)
    expect(deleted.deletedAt).not.toBeNull()
    expect(deleted.isFavorite).toBe(false)

    const restored = await repository.restore(page.id)
    expect(restored.isDeleted).toBe(false)
    expect(restored.deletedAt).toBeNull()

    await repository.purge(page.id)
    expect(await repository.getById(page.id)).toBeNull()
  })

  it('lists favorites and searches by title/plainText', async () => {
    const a = await repository.create({
      workspaceId: 'ws-1',
      title: 'Alpha plan',
      plainText: 'roadmap details',
      isFavorite: true,
    })
    await repository.create({
      workspaceId: 'ws-1',
      title: 'Beta',
      plainText: 'other',
    })
    await repository.create({
      workspaceId: 'ws-2',
      title: 'Alpha plan',
      isFavorite: true,
    })

    const favorites = await repository.listFavorites('ws-1')
    expect(favorites.map((p) => p.id)).toEqual([a.id])

    const byTitle = await repository.search('ws-1', 'alpha')
    expect(byTitle).toHaveLength(1)

    const byBody = await repository.search('ws-1', 'roadmap')
    expect(byBody).toHaveLength(1)
  })

  it('reorders siblings', async () => {
    const a = await repository.create({ workspaceId: 'ws-1', title: 'A' })
    const b = await repository.create({ workspaceId: 'ws-1', title: 'B' })
    const c = await repository.create({ workspaceId: 'ws-1', title: 'C' })

    const ordered = await repository.reorder('ws-1', null, [c.id, a.id, b.id])
    expect(ordered.map((p) => p.id)).toEqual([c.id, a.id, b.id])
    expect(ordered.map((p) => p.sortOrder)).toEqual([0, 1, 2])
  })

  it('excludes deleted pages from list by default', async () => {
    const live = await repository.create({ workspaceId: 'ws-1', title: 'Live' })
    const gone = await repository.create({ workspaceId: 'ws-1', title: 'Gone' })
    await repository.softDelete(gone.id)

    const listed = await repository.listByWorkspace('ws-1')
    expect(listed.map((p) => p.id)).toEqual([live.id])

    const withDeleted = await repository.listByWorkspace('ws-1', {
      includeDeleted: true,
    })
    expect(withDeleted).toHaveLength(2)
  })
})
