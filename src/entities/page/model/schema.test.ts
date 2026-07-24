import { describe, expect, it } from 'vitest'

import { CreatePageInputSchema, PageSchema } from './schema'
import { EMPTY_DOC } from './types'

describe('PageSchema', () => {
  const validPage = {
    id: 'page-1',
    workspaceId: 'ws-1',
    parentId: null,
    title: 'Hello',
    icon: '📝',
    cover: null,
    content: EMPTY_DOC,
    plainText: 'Hello',
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    sortOrder: 0,
    isCollapsed: false,
  }

  it('accepts a valid page', () => {
    expect(PageSchema.parse(validPage).title).toBe('Hello')
  })

  it('rejects missing id', () => {
    const { id: _id, ...rest } = validPage
    expect(() => PageSchema.parse(rest)).toThrow()
  })

  it('rejects non-doc content', () => {
    expect(() =>
      PageSchema.parse({
        ...validPage,
        content: { type: 'paragraph' },
      }),
    ).toThrow()
  })
})

describe('CreatePageInputSchema', () => {
  it('requires workspaceId and allows defaults', () => {
    const parsed = CreatePageInputSchema.parse({ workspaceId: 'ws-1' })
    expect(parsed.workspaceId).toBe('ws-1')
    expect(parsed.title).toBeUndefined()
  })

  it('rejects empty workspaceId', () => {
    expect(() => CreatePageInputSchema.parse({ workspaceId: '' })).toThrow()
  })
})
