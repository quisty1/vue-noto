import { z } from 'zod'

const JSONContentSchema: z.ZodType<Record<string, unknown>> = z.lazy(() =>
  z
    .object({
      type: z.string(),
      attrs: z.record(z.unknown()).optional(),
      content: z.array(JSONContentSchema).optional(),
      marks: z
        .array(
          z.object({
            type: z.string(),
            attrs: z.record(z.unknown()).optional(),
          }),
        )
        .optional(),
      text: z.string().optional(),
    })
    .passthrough(),
)

export const JSONDocSchema = z
  .object({
    type: z.literal('doc'),
    content: z.array(JSONContentSchema).optional(),
  })
  .passthrough()

export const PageSchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  parentId: z.string().nullable(),
  title: z.string(),
  icon: z.string().nullable(),
  cover: z.string().nullable(),
  content: JSONDocSchema,
  plainText: z.string(),
  isFavorite: z.boolean(),
  isDeleted: z.boolean(),
  deletedAt: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  updatedAt: z.string().datetime({ offset: true }).or(z.string().min(1)),
  sortOrder: z.number().int().nonnegative(),
  isCollapsed: z.boolean(),
})

export const CreatePageInputSchema = z.object({
  workspaceId: z.string().min(1),
  parentId: z.string().nullable().optional(),
  title: z.string().optional(),
  icon: z.string().nullable().optional(),
  cover: z.string().nullable().optional(),
  content: JSONDocSchema.optional(),
  plainText: z.string().optional(),
  isFavorite: z.boolean().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isCollapsed: z.boolean().optional(),
})

export type PageSchemaType = z.infer<typeof PageSchema>
export type CreatePageInputSchemaType = z.infer<typeof CreatePageInputSchema>
