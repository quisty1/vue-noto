import { describe, expect, it } from 'vitest'

import { EMPTY_DOC, type Page } from '@entities/page'
import type { Workspace } from '@entities/workspace'

import { exportPageMarkdown } from './export-markdown'
import { workspaceExportToJson } from './export-workspace'
import { importPageMarkdown } from './import-markdown'
import { parseWorkspaceExport } from './import-workspace'
import { WORKSPACE_EXPORT_VERSION } from '../model/export-schema'

function sampleWorkspace(): Workspace {
  return {
    id: 'ws-1',
    name: 'Demo',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

function samplePage(partial?: Partial<Page>): Page {
  return {
    id: 'p-1',
    workspaceId: 'ws-1',
    parentId: null,
    title: 'Notes',
    icon: '📝',
    cover: null,
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Hello' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'World' }],
        },
      ],
    },
    plainText: 'Hello World',
    isFavorite: false,
    isDeleted: false,
    deletedAt: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    sortOrder: 0,
    isCollapsed: false,
    ...partial,
  }
}

describe('workspaceExportToJson', () => {
  it('serializes workspace payload with version', () => {
    const json = workspaceExportToJson({
      version: WORKSPACE_EXPORT_VERSION,
      exportedAt: '2026-01-01T00:00:00.000Z',
      workspace: sampleWorkspace(),
      pages: [samplePage()],
      snapshots: [],
    })
    const parsed = JSON.parse(json) as { version: number; workspace: { id: string } }
    expect(parsed.version).toBe(WORKSPACE_EXPORT_VERSION)
    expect(parsed.workspace.id).toBe('ws-1')
  })
})

describe('markdown import/export', () => {
  it('exports page content to markdown', () => {
    const result = exportPageMarkdown(samplePage())
    expect(result.markdown).toContain('# Notes')
    expect(result.markdown).toContain('Hello')
    expect(result.filename).toBe('notes.md')
  })

  it('imports markdown into page fields', () => {
    const imported = importPageMarkdown('# Title\n\nParagraph')
    expect(imported.title).toBe('Title')
    expect(imported.content.type).toBe('doc')
    expect(imported.plainText).toContain('Paragraph')
  })

  it('round-trips export schema validation', () => {
    const json = workspaceExportToJson({
      version: WORKSPACE_EXPORT_VERSION,
      exportedAt: '2026-01-01T00:00:00.000Z',
      workspace: sampleWorkspace(),
      pages: [samplePage({ content: EMPTY_DOC, plainText: '' })],
      snapshots: [],
    })
    const result = parseWorkspaceExport(json)
    expect(result).toMatchObject({
      workspace: { id: 'ws-1' },
    })
  })
})
