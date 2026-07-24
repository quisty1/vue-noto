import { describe, expect, it } from 'vitest'

import { WORKSPACE_EXPORT_VERSION, type WorkspaceExport } from '../model/export-schema'
import {
  ImportValidationError,
  hasDangerousKeys,
  parseWorkspaceExport,
  safeParseJson,
} from './import-workspace'
import { EMPTY_DOC } from '@entities/page'

function sampleExport(overrides: Partial<WorkspaceExport> = {}): WorkspaceExport {
  return {
    version: WORKSPACE_EXPORT_VERSION,
    exportedAt: '2026-07-24T12:00:00.000Z',
    workspace: {
      id: 'ws-1',
      name: 'Demo',
      createdAt: '2026-07-24T12:00:00.000Z',
      updatedAt: '2026-07-24T12:00:00.000Z',
    },
    pages: [
      {
        id: 'page-1',
        workspaceId: 'ws-1',
        parentId: null,
        title: 'Hello',
        icon: null,
        cover: null,
        content: EMPTY_DOC,
        plainText: 'Hello',
        isFavorite: false,
        isDeleted: false,
        deletedAt: null,
        createdAt: '2026-07-24T12:00:00.000Z',
        updatedAt: '2026-07-24T12:00:00.000Z',
        sortOrder: 0,
        isCollapsed: false,
      },
    ],
    snapshots: [],
    ...overrides,
  }
}

describe('hasDangerousKeys', () => {
  it('detects __proto__ and constructor', () => {
    expect(hasDangerousKeys({ a: 1 })).toBe(false)

    const withProto = Object.create(null) as Record<string, unknown>
    withProto.__proto__ = { x: 1 }
    expect(hasDangerousKeys(withProto)).toBe(true)

    const withConstructor = Object.create(null) as Record<string, unknown>
    withConstructor.nested = { constructor: {} }
    expect(hasDangerousKeys(withConstructor)).toBe(true)
  })
})

describe('safeParseJson', () => {
  it('parses safe payloads', () => {
    expect(safeParseJson('{"ok":true}')).toEqual({ ok: true })
  })

  it('rejects forbidden keys via reviver', () => {
    expect(() => safeParseJson('{"__proto__":{"polluted":true}}')).toThrow(ImportValidationError)
    expect(() => safeParseJson('{"constructor":{}}')).toThrow(ImportValidationError)
  })
})

describe('parseWorkspaceExport', () => {
  it('validates a correct export', () => {
    const payload = JSON.stringify(sampleExport())
    const parsed = parseWorkspaceExport(payload)
    expect(parsed.workspace.name).toBe('Demo')
    expect(parsed.pages).toHaveLength(1)
  })

  it('rejects invalid version', () => {
    const payload = JSON.stringify(sampleExport({ version: 99 as 1 }))
    expect(() => parseWorkspaceExport(payload)).toThrow(ImportValidationError)
  })

  it('rejects oversized payloads', () => {
    const huge = `"${'a'.repeat(5 * 1024 * 1024 + 10)}"`
    expect(() => parseWorkspaceExport(huge)).toThrow(/size limit/)
  })

  it('rejects malformed page records', () => {
    const bad = sampleExport()
    const page = bad.pages[0]!
    ;(page as { sortOrder: unknown }).sortOrder = 'nope'
    expect(() => parseWorkspaceExport(JSON.stringify(bad))).toThrow(ImportValidationError)
  })
})
