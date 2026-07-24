/**
 * Validate and import workspace JSON (replace or merge) with size / prototype checks
 */
import type { NotoDatabase, PageRecord, SnapshotRecord } from '@shared/lib/db'
import { db as defaultDb } from '@shared/lib/db'

import {
  MAX_IMPORT_BYTES,
  WorkspaceExportSchema,
  type WorkspaceExport,
} from '../model/export-schema'

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype'])

export type ImportMode = 'replace' | 'merge'

export type ImportWorkspaceOptions = {
  mode?: ImportMode
  maxBytes?: number
  database?: NotoDatabase
}

export class ImportValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImportValidationError'
  }
}

/** Reject objects that could pollute prototypes during merge */
export function hasDangerousKeys(value: unknown): boolean {
  if (value === null || typeof value !== 'object') return false

  if (Array.isArray(value)) {
    return value.some(hasDangerousKeys)
  }

  for (const key of Reflect.ownKeys(value as object)) {
    const name = String(key)
    if (DANGEROUS_KEYS.has(name)) return true
    if (hasDangerousKeys((value as Record<string | symbol, unknown>)[key as string])) {
      return true
    }
  }

  return false
}

function assertSize(payload: string, maxBytes: number): void {
  const bytes = new TextEncoder().encode(payload).byteLength
  if (bytes > maxBytes) {
    throw new ImportValidationError(
      `Import payload exceeds size limit (${bytes} > ${maxBytes} bytes)`,
    )
  }
}

/** Safe JSON parse that rejects dangerous keys */
export function safeParseJson(payload: string): unknown {
  const parsed: unknown = JSON.parse(payload, (key, value) => {
    if (DANGEROUS_KEYS.has(key)) {
      throw new ImportValidationError(`Forbidden key in JSON: ${key}`)
    }
    return value
  })

  if (hasDangerousKeys(parsed)) {
    throw new ImportValidationError('Payload contains forbidden keys')
  }

  return parsed
}

export function parseWorkspaceExport(payload: string): WorkspaceExport {
  assertSize(payload, MAX_IMPORT_BYTES)
  const raw = safeParseJson(payload)
  const result = WorkspaceExportSchema.safeParse(raw)

  if (!result.success) {
    throw new ImportValidationError(
      `Invalid workspace export: ${result.error.issues.map((i) => i.message).join('; ')}`,
    )
  }

  return result.data
}

async function replaceWorkspace(
  data: WorkspaceExport,
  database: NotoDatabase,
): Promise<WorkspaceExport> {
  const workspaceId = data.workspace.id

  // Wipe existing workspace graph then write the imported payload
  await database.transaction(
    'rw',
    database.workspaces,
    database.pages,
    database.snapshots,
    async () => {
      const existingPages = await database.pages.where('workspaceId').equals(workspaceId).toArray()

      for (const page of existingPages) {
        await database.snapshots.where('pageId').equals(page.id).delete()
      }
      await database.pages.where('workspaceId').equals(workspaceId).delete()
      await database.workspaces.delete(workspaceId)

      await database.workspaces.put(data.workspace)
      if (data.pages.length > 0) {
        await database.pages.bulkPut(data.pages as PageRecord[])
      }
      if (data.snapshots.length > 0) {
        await database.snapshots.bulkPut(data.snapshots as SnapshotRecord[])
      }
    },
  )

  return data
}

async function mergeWorkspace(
  data: WorkspaceExport,
  database: NotoDatabase,
): Promise<WorkspaceExport> {
  // Upsert by id without deleting unrelated local pages
  await database.transaction(
    'rw',
    database.workspaces,
    database.pages,
    database.snapshots,
    async () => {
      await database.workspaces.put(data.workspace)

      for (const page of data.pages) {
        await database.pages.put(page as PageRecord)
      }

      for (const snapshot of data.snapshots) {
        await database.snapshots.put(snapshot as SnapshotRecord)
      }
    },
  )

  return data
}

/** Validate and import a workspace JSON payload */
export async function importWorkspace(
  payload: string,
  options: ImportWorkspaceOptions = {},
): Promise<WorkspaceExport> {
  const { mode = 'replace', maxBytes = MAX_IMPORT_BYTES, database = defaultDb } = options

  assertSize(payload, maxBytes)
  const data = parseWorkspaceExport(payload)

  if (mode === 'merge') {
    return mergeWorkspace(data, database)
  }

  return replaceWorkspace(data, database)
}
