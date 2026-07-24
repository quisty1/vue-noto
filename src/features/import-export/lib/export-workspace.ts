/**
 * Serialize a workspace (pages + snapshots) to the export JSON shape
 */
import type { NotoDatabase } from '@shared/lib/db'
import { db as defaultDb } from '@shared/lib/db'

import { WORKSPACE_EXPORT_VERSION, type WorkspaceExport } from '../model/export-schema'

/** Load workspace graph from IndexedDB into a portable export object */
export async function exportWorkspace(
  workspaceId: string,
  database: NotoDatabase = defaultDb,
): Promise<WorkspaceExport> {
  const workspace = await database.workspaces.get(workspaceId)
  if (!workspace) {
    throw new Error(`Workspace ${workspaceId} not found`)
  }

  const pages = await database.pages.where('workspaceId').equals(workspaceId).toArray()
  const pageIds = pages.map((p) => p.id)

  const snapshots =
    pageIds.length === 0
      ? []
      : (
          await Promise.all(
            pageIds.map((pageId) => database.snapshots.where('pageId').equals(pageId).toArray()),
          )
        ).flat()

  return {
    version: WORKSPACE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    workspace,
    pages,
    snapshots,
  }
}

export function workspaceExportToJson(data: WorkspaceExport, pretty = true): string {
  return JSON.stringify(data, null, pretty ? 2 : undefined)
}
