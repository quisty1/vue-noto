/**
 * Seed a demo workspace with nested sample pages for first-run / onboarding
 */
import type { JSONDoc } from '@shared/lib/db'
import { db } from '@shared/lib/db'
import { createId } from '@shared/lib/id'

import type { Page } from '@entities/page'
import type { Workspace } from '../model/types'

function nowIso(): string {
  return new Date().toISOString()
}

/** TipTap JSON doc plus denormalized plainText for search */
function doc(
  blocks: NonNullable<JSONDoc['content']>,
  plainText: string,
): { content: JSONDoc; plainText: string } {
  return {
    content: { type: 'doc', content: blocks },
    plainText,
  }
}

function paragraph(text: string) {
  return {
    type: 'paragraph',
    content: text ? [{ type: 'text', text }] : undefined,
  }
}

function heading(level: 1 | 2 | 3, text: string) {
  return {
    type: 'heading',
    attrs: { level },
    content: [{ type: 'text', text }],
  }
}

function bulletList(items: string[]) {
  return {
    type: 'bulletList',
    content: items.map((text) => ({
      type: 'listItem',
      content: [paragraph(text)],
    })),
  }
}

function orderedList(items: string[]) {
  return {
    type: 'orderedList',
    content: items.map((text) => ({
      type: 'listItem',
      content: [paragraph(text)],
    })),
  }
}

function taskList(items: Array<{ text: string; checked: boolean }>) {
  return {
    type: 'taskList',
    content: items.map(({ text, checked }) => ({
      type: 'taskItem',
      attrs: { checked },
      content: [paragraph(text)],
    })),
  }
}

function blockquote(text: string) {
  return {
    type: 'blockquote',
    content: [paragraph(text)],
  }
}

function codeBlock(code: string, language = 'text') {
  return {
    type: 'codeBlock',
    attrs: { language },
    content: [{ type: 'text', text: code }],
  }
}

function hr() {
  return { type: 'horizontalRule' }
}

function linkParagraph(before: string, label: string, href: string, after = '') {
  return {
    type: 'paragraph',
    content: [
      ...(before ? [{ type: 'text', text: before }] : []),
      {
        type: 'text',
        marks: [{ type: 'link', attrs: { href, target: '_blank' } }],
        text: label,
      },
      ...(after ? [{ type: 'text', text: after }] : []),
    ],
  }
}

export interface SeedDemoResult {
  workspace: Workspace
  pages: Page[]
}

/** Creates a demo workspace with five example pages */
export async function seedDemoWorkspace(name = 'Demo Workspace'): Promise<SeedDemoResult> {
  const timestamp = nowIso()
  const workspaceId = createId()

  const workspace: Workspace = {
    id: workspaceId,
    name,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  const gettingStartedId = createId()
  const productSpecId = createId()
  const meetingNotesId = createId()
  const meetingAgendaId = createId()
  const meetingActionsId = createId()
  const personalGoalsId = createId()
  const markdownTipsId = createId()

  // --- Demo page: Getting Started ---
  const gettingStarted = doc(
    [
      heading(1, 'Welcome to Noto'),
      paragraph(
        'Noto is a local-first workspace for notes and documents. Everything stays on your device until you choose to export.',
      ),
      heading(2, 'Quick start'),
      orderedList([
        'Create pages from the sidebar',
        'Nest pages by dragging them under a parent',
        'Mark important pages as favorites',
        'Export a workspace as JSON or a page as Markdown',
      ]),
      heading(2, 'Editing tips'),
      bulletList([
        'Use headings to structure long documents',
        'Toggle task lists for checkable action items',
        'Snapshots keep a short history of page versions',
      ]),
      blockquote('Tip: search looks through page titles and plain text.'),
    ],
    [
      'Welcome to Noto',
      'Noto is a local-first workspace for notes and documents. Everything stays on your device until you choose to export.',
      'Quick start',
      'Create pages from the sidebar',
      'Nest pages by dragging them under a parent',
      'Mark important pages as favorites',
      'Export a workspace as JSON or a page as Markdown',
      'Editing tips',
      'Use headings to structure long documents',
      'Toggle task lists for checkable action items',
      'Snapshots keep a short history of page versions',
      'Tip: search looks through page titles and plain text.',
    ].join('\n'),
  )

  // --- Demo page: Product Spec ---
  const productSpec = doc(
    [
      heading(1, 'Product Spec'),
      paragraph('Working draft for the Noto MVP.'),
      heading(2, 'Problem'),
      paragraph(
        'People need a calm, offline-capable notes app with hierarchical pages and portable exports.',
      ),
      heading(2, 'Goals'),
      bulletList([
        'Local-first persistence with IndexedDB',
        'Rich text editing based on TipTap',
        'Import and export for backup and migration',
      ]),
      heading(2, 'Non-goals'),
      bulletList(['Realtime multiplayer for v1', 'Cloud sync as a hard requirement']),
      heading(2, 'Success metrics'),
      orderedList([
        'Create and nest pages without data loss',
        'Round-trip Markdown export/import for common blocks',
        'Restore from a workspace JSON backup',
      ]),
      hr(),
      paragraph('Owner: Product · Status: Draft'),
    ],
    [
      'Product Spec',
      'Working draft for the Noto MVP.',
      'Problem',
      'People need a calm, offline-capable notes app with hierarchical pages and portable exports.',
      'Goals',
      'Local-first persistence with IndexedDB',
      'Rich text editing based on TipTap',
      'Import and export for backup and migration',
      'Non-goals',
      'Realtime multiplayer for v1',
      'Cloud sync as a hard requirement',
      'Success metrics',
      'Create and nest pages without data loss',
      'Round-trip Markdown export/import for common blocks',
      'Restore from a workspace JSON backup',
      'Owner: Product · Status: Draft',
    ].join('\n'),
  )

  // --- Demo page: Meeting Notes (parent of agenda / actions) ---
  const meetingNotes = doc(
    [
      heading(1, 'Weekly Sync'),
      paragraph('Date: 2026-07-20 · Attendees: Alex, Sam, Jordan'),
      heading(2, 'Summary'),
      paragraph(
        'Aligned on MVP scope, decided to ship tree navigation before cloud sync, and assigned follow-ups below.',
      ),
      heading(2, 'Decisions'),
      bulletList([
        'Ship soft-delete with restore before purge',
        'Cap snapshots at 20 per page',
        'Keep English as the default demo content language',
      ]),
    ],
    [
      'Weekly Sync',
      'Date: 2026-07-20 · Attendees: Alex, Sam, Jordan',
      'Summary',
      'Aligned on MVP scope, decided to ship tree navigation before cloud sync, and assigned follow-ups below.',
      'Decisions',
      'Ship soft-delete with restore before purge',
      'Cap snapshots at 20 per page',
      'Keep English as the default demo content language',
    ].join('\n'),
  )

  // --- Nested under Meeting Notes: Agenda ---
  const meetingAgenda = doc(
    [
      heading(2, 'Agenda'),
      orderedList([
        'Review last week action items',
        'Demo page tree and favorites',
        'Discuss import size limits',
        'Plan next release checklist',
      ]),
    ],
    [
      'Agenda',
      'Review last week action items',
      'Demo page tree and favorites',
      'Discuss import size limits',
      'Plan next release checklist',
    ].join('\n'),
  )

  // --- Nested under Meeting Notes: Action Items ---
  const meetingActions = doc(
    [
      heading(2, 'Action items'),
      taskList([
        { text: 'Alex — polish Getting Started copy', checked: true },
        { text: 'Sam — write import validation tests', checked: false },
        { text: 'Jordan — design trash restore UX', checked: false },
      ]),
    ],
    [
      'Action items',
      'Alex — polish Getting Started copy',
      'Sam — write import validation tests',
      'Jordan — design trash restore UX',
    ].join('\n'),
  )

  // --- Demo page: Personal Goals ---
  const personalGoals = doc(
    [
      heading(1, 'Personal Goals'),
      paragraph('Focus areas for this quarter.'),
      heading(2, 'Health'),
      taskList([
        { text: 'Walk 8k steps on weekdays', checked: false },
        { text: 'Sleep before midnight on weeknights', checked: true },
      ]),
      heading(2, 'Learning'),
      bulletList([
        'Finish a Vue 3 + TipTap deep dive',
        'Practice Dexie migrations on a throwaway DB',
      ]),
      heading(2, 'Weekly check-in'),
      blockquote('What moved forward this week, and what is blocked?'),
    ],
    [
      'Personal Goals',
      'Focus areas for this quarter.',
      'Health',
      'Walk 8k steps on weekdays',
      'Sleep before midnight on weeknights',
      'Learning',
      'Finish a Vue 3 + TipTap deep dive',
      'Practice Dexie migrations on a throwaway DB',
      'Weekly check-in',
      'What moved forward this week, and what is blocked?',
    ].join('\n'),
  )

  // --- Demo page: Markdown Tips ---
  const markdownTips = doc(
    [
      heading(1, 'Markdown Tips'),
      paragraph('Noto can convert common Markdown constructs to TipTap JSON and back.'),
      heading(2, 'Supported blocks'),
      bulletList([
        'Headings (# ## ###)',
        'Bullet and ordered lists',
        'Task lists (- [ ] / - [x])',
        'Fenced code blocks',
        'Block quotes and horizontal rules',
        'Inline links',
      ]),
      heading(2, 'Example code'),
      codeBlock("const greeting = 'hello noto'\nconsole.log(greeting)", 'javascript'),
      heading(2, 'Links'),
      linkParagraph('Read more in the ', 'export docs', 'https://example.com/docs', '.'),
      hr(),
      blockquote('Prefer short pages nested under a parent instead of one giant note.'),
    ],
    [
      'Markdown Tips',
      'Noto can convert common Markdown constructs to TipTap JSON and back.',
      'Supported blocks',
      'Headings (# ## ###)',
      'Bullet and ordered lists',
      'Task lists (- [ ] / - [x])',
      'Fenced code blocks',
      'Block quotes and horizontal rules',
      'Inline links',
      'Example code',
      "const greeting = 'hello noto'",
      'console.log(greeting)',
      'Links',
      'Read more in the export docs.',
      'Prefer short pages nested under a parent instead of one giant note.',
    ].join('\n'),
  )

  const pages: Page[] = [
    {
      id: gettingStartedId,
      workspaceId,
      parentId: null,
      title: 'Getting Started',
      icon: '🚀',
      cover: null,
      ...gettingStarted,
      isFavorite: true,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: 0,
      isCollapsed: false,
    },
    {
      id: productSpecId,
      workspaceId,
      parentId: null,
      title: 'Product Spec',
      icon: '📋',
      cover: null,
      ...productSpec,
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: 1,
      isCollapsed: false,
    },
    {
      id: meetingNotesId,
      workspaceId,
      parentId: null,
      title: 'Meeting Notes',
      icon: '🗓️',
      cover: null,
      ...meetingNotes,
      isFavorite: true,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: 2,
      isCollapsed: false,
    },
    {
      id: meetingAgendaId,
      workspaceId,
      parentId: meetingNotesId,
      title: 'Agenda',
      icon: null,
      cover: null,
      ...meetingAgenda,
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: 0,
      isCollapsed: false,
    },
    {
      id: meetingActionsId,
      workspaceId,
      parentId: meetingNotesId,
      title: 'Action Items',
      icon: null,
      cover: null,
      ...meetingActions,
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: 1,
      isCollapsed: false,
    },
    {
      id: personalGoalsId,
      workspaceId,
      parentId: null,
      title: 'Personal Goals',
      icon: '🎯',
      cover: null,
      ...personalGoals,
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: 3,
      isCollapsed: false,
    },
    {
      id: markdownTipsId,
      workspaceId,
      parentId: null,
      title: 'Markdown Tips',
      icon: '✍️',
      cover: null,
      ...markdownTips,
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      sortOrder: 4,
      isCollapsed: false,
    },
  ]

  await db.transaction('rw', db.workspaces, db.pages, async () => {
    await db.workspaces.put(workspace)
    await db.pages.bulkPut(pages)
  })

  return { workspace, pages }
}
