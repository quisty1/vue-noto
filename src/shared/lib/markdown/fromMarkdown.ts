/**
 * Parse Markdown into TipTap JSON (and plain-text extraction for search)
 */
import MarkdownIt from 'markdown-it'

import type { JSONContent, JSONDoc } from '@shared/lib/db'

type MarkdownToken = {
  type: string
  tag: string
  content: string
  info: string
  children: MarkdownToken[] | null
  attrGet: (name: string) => string | null
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
})

function textNode(text: string, marks?: JSONContent['marks']): JSONContent {
  const node: JSONContent = { type: 'text', text }
  if (marks && marks.length > 0) node.marks = marks
  return node
}

/** Walk inline tokens into TipTap text nodes with mark stack */
function inlineFromTokens(tokens: MarkdownToken[] | null | undefined): JSONContent[] {
  if (!tokens || tokens.length === 0) return []

  const nodes: JSONContent[] = []
  const markStack: Array<{ type: string; attrs?: Record<string, unknown> }> = []

  const currentMarks = (): JSONContent['marks'] =>
    markStack.length > 0
      ? markStack.map((m) => (m.attrs ? { type: m.type, attrs: m.attrs } : { type: m.type }))
      : undefined

  for (const token of tokens) {
    if (token.type === 'text') {
      nodes.push(textNode(token.content, currentMarks()))
      continue
    }
    if (token.type === 'code_inline') {
      nodes.push(textNode(token.content, [{ type: 'code' }]))
      continue
    }
    if (token.type === 'softbreak' || token.type === 'hardbreak') {
      nodes.push({ type: 'hardBreak' })
      continue
    }
    if (token.type === 'strong_open') {
      markStack.push({ type: 'bold' })
      continue
    }
    if (token.type === 'em_open') {
      markStack.push({ type: 'italic' })
      continue
    }
    if (token.type === 's_open') {
      markStack.push({ type: 'strike' })
      continue
    }
    if (token.type === 'link_open') {
      const href = token.attrGet('href') ?? ''
      markStack.push({ type: 'link', attrs: { href, target: '_blank' } })
      continue
    }
    if (
      token.type === 'strong_close' ||
      token.type === 'em_close' ||
      token.type === 's_close' ||
      token.type === 'link_close'
    ) {
      markStack.pop()
      continue
    }
  }

  return nodes
}

/** Detect GFM task-list checkbox at the start of a list item */
function isTaskItem(tokens: MarkdownToken[], index: number): { checked: boolean } | null {
  const inline = tokens[index + 1]
  if (!inline || inline.type !== 'inline' || !inline.children) return null

  const first = inline.children[0]
  if (!first || first.type !== 'text') return null

  const match = first.content.match(/^\[([ xX])\]\s+/)
  if (!match) return null

  return { checked: match[1]!.toLowerCase() === 'x' }
}

function stripTaskPrefix(tokens: MarkdownToken[]): MarkdownToken[] {
  return tokens.map((token, index) => {
    if (index === 0 && token.type === 'text') {
      return {
        ...token,
        content: token.content.replace(/^\[([ xX])\]\s+/, ''),
      }
    }
    return token
  })
}

/** Convert block-level markdown-it tokens into TipTap JSON nodes */
function parseBlocks(tokens: MarkdownToken[]): JSONContent[] {
  const blocks: JSONContent[] = []
  let i = 0

  while (i < tokens.length) {
    const token = tokens[i]!

    if (token.type === 'heading_open') {
      const level = Number(token.tag.replace('h', '')) as 1 | 2 | 3 | 4 | 5 | 6
      const inline = tokens[i + 1]
      blocks.push({
        type: 'heading',
        attrs: { level },
        content: inlineFromTokens(inline?.children),
      })
      i += 3
      continue
    }

    if (token.type === 'paragraph_open') {
      const inline = tokens[i + 1]
      blocks.push({
        type: 'paragraph',
        content: inlineFromTokens(inline?.children),
      })
      i += 3
      continue
    }

    if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
      const ordered = token.type === 'ordered_list_open'
      const closeType = ordered ? 'ordered_list_close' : 'bullet_list_close'
      const start = i + 1
      let depth = 1
      let end = start

      while (end < tokens.length && depth > 0) {
        const t = tokens[end]!
        if (t.type === token.type) depth++
        if (t.type === closeType) depth--
        if (depth > 0) end++
      }

      const inner = tokens.slice(start, end)
      const items: JSONContent[] = []
      let j = 0
      let taskMode: boolean | null = null

      while (j < inner.length) {
        if (inner[j]!.type !== 'list_item_open') {
          j++
          continue
        }

        let itemDepth = 1
        let itemEnd = j + 1
        while (itemEnd < inner.length && itemDepth > 0) {
          const t = inner[itemEnd]!
          if (t.type === 'list_item_open') itemDepth++
          if (t.type === 'list_item_close') itemDepth--
          if (itemDepth > 0) itemEnd++
        }

        const itemTokens = inner.slice(j + 1, itemEnd)
        const task = isTaskItem(itemTokens, 0)

        if (taskMode === null) taskMode = task !== null

        if (task) {
          const para = itemTokens.find((t) => t.type === 'inline')
          const children = para?.children ? stripTaskPrefix(para.children) : []
          items.push({
            type: 'taskItem',
            attrs: { checked: task.checked },
            content: [
              {
                type: 'paragraph',
                content: inlineFromTokens(children),
              },
            ],
          })
        } else {
          const nestedBlocks = parseBlocks(itemTokens)
          items.push({
            type: 'listItem',
            content: nestedBlocks.length > 0 ? nestedBlocks : [{ type: 'paragraph' }],
          })
        }

        j = itemEnd + 1
      }

      if (taskMode) {
        blocks.push({ type: 'taskList', content: items })
      } else {
        blocks.push({
          type: ordered ? 'orderedList' : 'bulletList',
          content: items,
        })
      }

      i = end + 1
      continue
    }

    if (token.type === 'blockquote_open') {
      let depth = 1
      let end = i + 1
      while (end < tokens.length && depth > 0) {
        const t = tokens[end]!
        if (t.type === 'blockquote_open') depth++
        if (t.type === 'blockquote_close') depth--
        if (depth > 0) end++
      }
      blocks.push({
        type: 'blockquote',
        content: parseBlocks(tokens.slice(i + 1, end)),
      })
      i = end + 1
      continue
    }

    if (token.type === 'fence' || token.type === 'code_block') {
      blocks.push({
        type: 'codeBlock',
        attrs: { language: token.info?.trim() || 'text' },
        content: token.content ? [{ type: 'text', text: token.content.replace(/\n$/, '') }] : [],
      })
      i++
      continue
    }

    if (token.type === 'hr') {
      blocks.push({ type: 'horizontalRule' })
      i++
      continue
    }

    i++
  }

  return blocks
}

/** Convert Markdown string to TipTap JSON (simplified) */
export function fromMarkdown(markdown: string): JSONDoc {
  const tokens = md.parse(markdown, {}) as MarkdownToken[]
  const content = parseBlocks(tokens)

  return {
    type: 'doc',
    content: content.length > 0 ? content : [{ type: 'paragraph' }],
  }
}

/** Extract searchable plain text from Markdown */
export function plainTextFromMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```\w*\n?/, '').replace(/```$/, ''))
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+(\[[ xX]\]\s+)?/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .replace(/\n{2,}/g, '\n')
    .trim()
}
