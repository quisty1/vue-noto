import { describe, expect, it } from 'vitest'

import type { Page } from './types'
import {
  buildTree,
  collectDescendantIds,
  findNode,
  flattenTree,
  getBreadcrumbs,
  movePage,
  reorderSiblings,
} from './tree'
import { EMPTY_DOC } from './types'

function page(
  partial: Pick<Page, 'id' | 'parentId' | 'sortOrder'> &
    Partial<Omit<Page, 'id' | 'parentId' | 'sortOrder'>>,
): Page {
  return {
    workspaceId: 'ws-1',
    title: partial.title ?? partial.id,
    icon: null,
    cover: null,
    content: EMPTY_DOC,
    plainText: '',
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    isCollapsed: false,
    ...partial,
  }
}

describe('buildTree / flattenTree', () => {
  it('builds a sorted forest and flattens back', () => {
    const pages = [
      page({ id: 'b', parentId: null, sortOrder: 1 }),
      page({ id: 'a', parentId: null, sortOrder: 0 }),
      page({ id: 'a1', parentId: 'a', sortOrder: 1, title: 'A1' }),
      page({ id: 'a0', parentId: 'a', sortOrder: 0, title: 'A0' }),
      page({ id: 'orphan', parentId: 'missing', sortOrder: 0 }),
    ]

    const tree = buildTree(pages)

    // orphan shares sortOrder 0 with a; stable id tie-break places orphan before b
    expect(tree.map((n) => n.id)).toEqual(['a', 'orphan', 'b'])
    expect(tree[0]!.children.map((n) => n.id)).toEqual(['a0', 'a1'])

    const flat = flattenTree(tree)
    expect(flat.map((p) => p.id)).toEqual(['a', 'a0', 'a1', 'orphan', 'b'])
    expect(flat[0]).not.toHaveProperty('children')
  })
})

describe('findNode', () => {
  it('finds nested nodes and returns null when missing', () => {
    const tree = buildTree([
      page({ id: 'root', parentId: null, sortOrder: 0 }),
      page({ id: 'child', parentId: 'root', sortOrder: 0 }),
      page({ id: 'grand', parentId: 'child', sortOrder: 0 }),
    ])

    expect(findNode(tree, 'grand')?.title).toBe('grand')
    expect(findNode(tree, 'nope')).toBeNull()
  })
})

describe('getBreadcrumbs', () => {
  it('returns the path from root to page', () => {
    const pages = [
      page({ id: 'root', parentId: null, sortOrder: 0, title: 'Root' }),
      page({ id: 'child', parentId: 'root', sortOrder: 0, title: 'Child' }),
      page({ id: 'leaf', parentId: 'child', sortOrder: 0, title: 'Leaf' }),
    ]

    expect(getBreadcrumbs(pages, 'leaf').map((p) => p.title)).toEqual(['Root', 'Child', 'Leaf'])
    expect(getBreadcrumbs(pages, 'missing')).toEqual([])
  })
})

describe('reorderSiblings', () => {
  it('updates sortOrder for siblings only', () => {
    const pages = [
      page({ id: 'a', parentId: null, sortOrder: 0 }),
      page({ id: 'b', parentId: null, sortOrder: 1 }),
      page({ id: 'c', parentId: null, sortOrder: 2 }),
      page({ id: 'x', parentId: 'a', sortOrder: 0 }),
    ]

    const next = reorderSiblings(pages, null, ['c', 'a', 'b'])
    expect(next.find((p) => p.id === 'c')?.sortOrder).toBe(0)
    expect(next.find((p) => p.id === 'a')?.sortOrder).toBe(1)
    expect(next.find((p) => p.id === 'b')?.sortOrder).toBe(2)
    expect(next.find((p) => p.id === 'x')?.sortOrder).toBe(0)
  })

  it('throws when orderedIds are incomplete', () => {
    const pages = [
      page({ id: 'a', parentId: null, sortOrder: 0 }),
      page({ id: 'b', parentId: null, sortOrder: 1 }),
    ]

    expect(() => reorderSiblings(pages, null, ['a'])).toThrow(/every sibling/)
  })
})

describe('movePage', () => {
  it('moves a page under a new parent at index', () => {
    const pages = [
      page({ id: 'root', parentId: null, sortOrder: 0 }),
      page({ id: 'a', parentId: 'root', sortOrder: 0 }),
      page({ id: 'b', parentId: 'root', sortOrder: 1 }),
      page({ id: 'c', parentId: null, sortOrder: 1 }),
    ]

    const next = movePage(pages, 'c', 'root', 1)
    const moved = next.find((p) => p.id === 'c')!

    expect(moved.parentId).toBe('root')
    expect(moved.sortOrder).toBe(1)
    expect(
      next
        .filter((p) => p.parentId === 'root')
        .sort((x, y) => x.sortOrder - y.sortOrder)
        .map((p) => p.id),
    ).toEqual(['a', 'c', 'b'])
  })

  it('rejects moves into descendants', () => {
    const pages = [
      page({ id: 'root', parentId: null, sortOrder: 0 }),
      page({ id: 'child', parentId: 'root', sortOrder: 0 }),
    ]

    expect(() => movePage(pages, 'root', 'child', 0)).toThrow(/descendant/)
  })
})

describe('collectDescendantIds', () => {
  it('collects nested descendants without the root', () => {
    const pages = [
      page({ id: 'root', parentId: null, sortOrder: 0 }),
      page({ id: 'a', parentId: 'root', sortOrder: 0 }),
      page({ id: 'b', parentId: 'a', sortOrder: 0 }),
      page({ id: 'c', parentId: 'root', sortOrder: 1 }),
      page({ id: 'other', parentId: null, sortOrder: 1 }),
    ]

    expect([...collectDescendantIds(pages, 'root')].sort()).toEqual(['a', 'b', 'c'])
    expect(collectDescendantIds(pages, 'other').size).toBe(0)
  })
})
