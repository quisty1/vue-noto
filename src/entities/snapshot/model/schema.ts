import { z } from 'zod'

import { JSONDocSchema } from '@entities/page'

export const SnapshotSchema = z.object({
  id: z.string().min(1),
  pageId: z.string().min(1),
  content: JSONDocSchema,
  createdAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  label: z.string().nullable(),
})

export const CreateSnapshotInputSchema = z.object({
  pageId: z.string().min(1),
  content: JSONDocSchema,
  label: z.string().nullable().optional(),
})

export type SnapshotSchemaType = z.infer<typeof SnapshotSchema>
export type CreateSnapshotInputSchemaType = z.infer<typeof CreateSnapshotInputSchema>
