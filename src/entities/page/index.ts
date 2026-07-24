export type { JSONContent, JSONDoc } from './model/types'
export type { CreatePageInput, Page, PageTreeNode, UpdatePageInput } from './model/types'
export { EMPTY_DOC } from './model/types'

export { CreatePageInputSchema, JSONDocSchema, PageSchema } from './model/schema'
export type { CreatePageInputSchemaType, PageSchemaType } from './model/schema'

export {
  buildTree,
  collectDescendantIds,
  findNode,
  flattenTree,
  getBreadcrumbs,
  movePage,
  reorderSiblings,
} from './model/tree'

export type { PageRepository } from './api/page-repository'
export { DexiePageRepository, pageRepository } from './api/page-repository'
