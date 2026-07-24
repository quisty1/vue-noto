/**
 * Zod schema for portable workspace export / import payloads
 */
import { z } from 'zod'

import { PageSchema } from '@entities/page'
import { SnapshotSchema } from '@entities/snapshot'
import { WorkspaceSchema } from '@entities/workspace'
import { MAX_IMPORT_BYTES } from '@shared/config'

/** Bump when the on-disk export shape changes incompatibly */
export const WORKSPACE_EXPORT_VERSION = 1 as const

export const WorkspaceExportSchema = z.object({
  version: z.literal(WORKSPACE_EXPORT_VERSION),
  exportedAt: z.string().min(1),
  workspace: WorkspaceSchema,
  pages: z.array(PageSchema),
  snapshots: z.array(SnapshotSchema).default([]),
})

export type WorkspaceExport = z.infer<typeof WorkspaceExportSchema>

export { MAX_IMPORT_BYTES }
