import { z } from 'zod'

export const WorkspaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  updatedAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
})

export const CreateWorkspaceInputSchema = z.object({
  name: z.string().min(1).max(200),
})

export type WorkspaceSchemaType = z.infer<typeof WorkspaceSchema>
export type CreateWorkspaceInputSchemaType = z.infer<typeof CreateWorkspaceInputSchema>
