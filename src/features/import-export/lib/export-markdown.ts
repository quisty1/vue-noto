/**
 * Single-page Markdown download helpers
 */
import { toMarkdown } from '@shared/lib/markdown'
import type { Page } from '@entities/page'

export type PageMarkdownExport = {
  title: string
  markdown: string
  filename: string
}

function slugify(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || 'page'
}

/** Export a single page to Markdown */
export function exportPageMarkdown(page: Page): PageMarkdownExport {
  const body = toMarkdown(page.content)
  const markdown = `# ${page.title}\n\n${body}`

  return {
    title: page.title,
    markdown,
    filename: `${slugify(page.title)}.md`,
  }
}
