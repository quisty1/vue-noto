/**
 * Parse a Markdown file into CreatePageInput fields
 */
import { fromMarkdown, plainTextFromMarkdown } from '@shared/lib/markdown'
import type { CreatePageInput, JSONDoc } from '@entities/page'

export type ImportedMarkdownPage = {
  title: string
  content: JSONDoc
  plainText: string
}

/** Parse a Markdown file into page fields */
export function importPageMarkdown(
  markdown: string,
  fallbackTitle = 'Imported page',
): ImportedMarkdownPage {
  const lines = markdown.replace(/^\uFEFF/, '').split(/\r?\n/)
  let title = fallbackTitle
  let bodyStart = 0

  // First ATX H1 becomes the page title when present
  if (lines[0]?.startsWith('# ')) {
    title = lines[0].slice(2).trim() || fallbackTitle
    bodyStart = 1
    while (lines[bodyStart] === '') bodyStart++
  }

  const body = lines.slice(bodyStart).join('\n')
  const content = fromMarkdown(body)

  return {
    title,
    content,
    plainText: plainTextFromMarkdown(body) || title,
  }
}

/** Map imported Markdown into CreatePageInput */
export function importedMarkdownToCreateInput(
  imported: ImportedMarkdownPage,
  workspaceId: string,
  parentId: string | null = null,
): CreatePageInput {
  return {
    workspaceId,
    parentId,
    title: imported.title,
    content: imported.content,
    plainText: imported.plainText,
  }
}
