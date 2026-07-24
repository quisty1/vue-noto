import type { JSONDoc } from '@shared/lib/db'

export interface Snapshot {
  id: string
  pageId: string
  content: JSONDoc
  createdAt: string
  label: string | null
}

export type CreateSnapshotInput = {
  pageId: string
  content: JSONDoc
  label?: string | null
}
