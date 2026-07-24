/**
 * TipTap JSON → Markdown (used by export and clipboard flows)
 */
import type { JSONContent, JSONDoc } from '@shared/lib/db'

function escapeMd(text: string): string {
  return text.replace(/([\\`*_[\]{}()#+.!|-])/g, '\\$1')
}

function renderMarks(text: string, marks?: JSONContent['marks']): string {
  if (!marks || marks.length === 0) return escapeMd(text)

  let result = escapeMd(text)

  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
      case 'strong':
        result = `**${result}**`
        break
      case 'italic':
      case 'em':
        result = `*${result}*`
        break
      case 'code':
        result = `\`${text}\``
        break
      case 'strike':
        result = `~~${result}~~`
        break
      case 'link': {
        const href = String(mark.attrs?.href ?? '')
        result = `[${text}](${href})`
        break
      }
      default:
        break
    }
  }

  return result
}

function inline(nodes: JSONContent[] | undefined): string {
  if (!nodes) return ''
  return nodes
    .map((node) => {
      if (node.type === 'text') {
        return renderMarks(node.text ?? '', node.marks)
      }
      if (node.type === 'hardBreak') return '  \n'
      return inline(node.content)
    })
    .join('')
}

function renderListItem(item: JSONContent, ordered: boolean, index: number): string {
  const prefix = ordered ? `${index}. ` : '- '
  const body = (item.content ?? [])
    .map((child, i) => {
      if (child.type === 'paragraph') {
        const text = inline(child.content)
        return i === 0 ? `${prefix}${text}` : `  ${text}`
      }
      if (child.type === 'bulletList' || child.type === 'orderedList') {
        return renderNode(child)
          .split('\n')
          .map((line) => (line ? `  ${line}` : line))
          .join('\n')
      }
      return renderNode(child)
    })
    .filter(Boolean)
    .join('\n')

  return body
}

function renderNode(node: JSONContent): string {
  switch (node.type) {
    case 'doc':
      return (node.content ?? []).map(renderNode).join('\n\n')
    case 'paragraph':
      return inline(node.content)
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level ?? 1), 1), 6)
      return `${'#'.repeat(level)} ${inline(node.content)}`
    }
    case 'bulletList':
      return (node.content ?? []).map((item) => renderListItem(item, false, 0)).join('\n')
    case 'orderedList':
      return (node.content ?? [])
        .map((item, index) => renderListItem(item, true, index + 1))
        .join('\n')
    case 'taskList':
      return (node.content ?? [])
        .map((item) => {
          const checked = Boolean(item.attrs?.checked)
          const text = inline(item.content?.[0]?.content)
          return `- [${checked ? 'x' : ' '}] ${text}`
        })
        .join('\n')
    case 'blockquote': {
      const inner = (node.content ?? []).map(renderNode).join('\n\n')
      return inner
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n')
    }
    case 'codeBlock': {
      const language = String(node.attrs?.language ?? '')
      const code = node.content?.map((c) => c.text ?? '').join('') ?? ''
      return `\`\`\`${language}\n${code}\n\`\`\``
    }
    case 'horizontalRule':
      return '---'
    case 'listItem':
    case 'taskItem':
      return (
        inline(node.content?.[0]?.content) ||
        renderNode({
          type: 'doc',
          content: node.content,
        })
      )
    default:
      if (node.content) {
        return node.content.map(renderNode).join('\n\n')
      }
      return ''
  }
}

/** Convert TipTap JSON document to Markdown */
export function toMarkdown(doc: JSONDoc | JSONContent): string {
  return renderNode(doc).trim() + '\n'
}
