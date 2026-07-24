/**
 * Flatten TipTap JSON into searchable plain text (keeps block newlines)
 */
import type { JSONContent } from '@entities/page'

export function extractPlainText(doc: JSONContent): string {
  const parts: string[] = []

  function walk(node: JSONContent): void {
    if (node.text) {
      parts.push(node.text)
    }
    if (node.content) {
      for (const child of node.content) {
        walk(child)
      }
      // Separate block-level nodes so search snippets stay readable
      if (
        node.type === 'paragraph' ||
        node.type === 'heading' ||
        node.type === 'listItem' ||
        node.type === 'taskItem' ||
        node.type === 'blockquote' ||
        node.type === 'codeBlock'
      ) {
        parts.push('\n')
      }
    }
  }

  walk(doc)
  return parts.join('').replace(/\n+/g, '\n').trim()
}
