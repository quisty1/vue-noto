/**
 * Page tree helpers: build, flatten, find, breadcrumbs, move
 */
import type { Page, PageTreeNode } from './types'

function compareSortOrder(a: Page, b: Page): number {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder
  }
  return a.createdAt.localeCompare(b.createdAt)
}

/** Build a forest of page trees from a flat list */
export function buildTree(pages: readonly Page[]): PageTreeNode[] {
  const byId = new Map<string, PageTreeNode>()
  const roots: PageTreeNode[] = []

  for (const page of pages) {
    byId.set(page.id, { ...page, children: [] })
  }

  for (const page of pages) {
    const node = byId.get(page.id)
    if (!node) continue

    if (page.parentId && byId.has(page.parentId)) {
      byId.get(page.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortRecursive = (nodes: PageTreeNode[]) => {
    nodes.sort(compareSortOrder)
    for (const node of nodes) {
      sortRecursive(node.children)
    }
  }

  sortRecursive(roots)
  return roots
}

/** Depth-first flatten of a page tree */
export function flattenTree(nodes: readonly PageTreeNode[]): Page[] {
  const result: Page[] = []

  const walk = (list: readonly PageTreeNode[]) => {
    for (const node of list) {
      const { children, ...page } = node
      result.push(page)
      walk(children)
    }
  }

  walk(nodes)
  return result
}

/** Find a node by id in a forest */
export function findNode(nodes: readonly PageTreeNode[], id: string): PageTreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

/** Breadcrumb trail from root to the page (inclusive) */
export function getBreadcrumbs(pages: readonly Page[], pageId: string): Page[] {
  const byId = new Map(pages.map((p) => [p.id, p]))
  const trail: Page[] = []
  let current = byId.get(pageId)

  while (current) {
    trail.unshift(current)
    current = current.parentId ? byId.get(current.parentId) : undefined
  }

  return trail
}

/**
 * Reorder siblings under the same parent
 * Returns a new array of pages with updated sortOrder for affected siblings
 */
export function reorderSiblings(
  pages: readonly Page[],
  parentId: string | null,
  orderedIds: readonly string[],
): Page[] {
  const siblingSet = new Set(
    pages.filter((p) => p.parentId === parentId && !p.isDeleted).map((p) => p.id),
  )

  for (const id of orderedIds) {
    if (!siblingSet.has(id)) {
      throw new Error(`Page ${id} is not a sibling under parent ${parentId}`)
    }
  }

  if (orderedIds.length !== siblingSet.size) {
    throw new Error('orderedIds must include every sibling exactly once')
  }

  const orderMap = new Map(orderedIds.map((id, index) => [id, index]))

  return pages.map((page) => {
    if (page.parentId !== parentId || page.isDeleted) return page
    const nextOrder = orderMap.get(page.id)
    if (nextOrder === undefined || nextOrder === page.sortOrder) return page
    return { ...page, sortOrder: nextOrder }
  })
}

/**
 * Move a page under a new parent at a given index among siblings
 * Rejects moves into own descendants
 */
export function movePage(
  pages: readonly Page[],
  pageId: string,
  newParentId: string | null,
  index: number,
): Page[] {
  const page = pages.find((p) => p.id === pageId)
  if (!page) {
    throw new Error(`Page ${pageId} not found`)
  }

  if (newParentId === pageId) {
    throw new Error('Cannot move a page under itself')
  }

  if (newParentId) {
    const descendants = collectDescendantIds(pages, pageId)
    if (descendants.has(newParentId)) {
      throw new Error('Cannot move a page under its descendant')
    }
    if (!pages.some((p) => p.id === newParentId)) {
      throw new Error(`Parent ${newParentId} not found`)
    }
  }

  const withoutMoved = pages.map((p) => (p.id === pageId ? { ...p, parentId: newParentId } : p))

  const siblings = withoutMoved
    .filter((p) => p.parentId === newParentId && !p.isDeleted && p.id !== pageId)
    .sort(compareSortOrder)

  const clamped = Math.max(0, Math.min(index, siblings.length))
  const orderedIds = [
    ...siblings.slice(0, clamped).map((p) => p.id),
    pageId,
    ...siblings.slice(clamped).map((p) => p.id),
  ]

  return reorderSiblings(withoutMoved, newParentId, orderedIds).map((p) =>
    p.id === pageId ? { ...p, parentId: newParentId } : p,
  )
}

/** Collect all descendant page ids (not including the root) */
export function collectDescendantIds(pages: readonly Page[], rootId: string): Set<string> {
  const childrenByParent = new Map<string, string[]>()

  for (const page of pages) {
    if (!page.parentId) continue
    const list = childrenByParent.get(page.parentId) ?? []
    list.push(page.id)
    childrenByParent.set(page.parentId, list)
  }

  const result = new Set<string>()
  const stack = [...(childrenByParent.get(rootId) ?? [])]

  while (stack.length > 0) {
    const id = stack.pop()!
    if (result.has(id)) continue
    result.add(id)
    const kids = childrenByParent.get(id)
    if (kids) stack.push(...kids)
  }

  return result
}
