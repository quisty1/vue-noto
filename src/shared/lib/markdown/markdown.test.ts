import { describe, expect, it } from 'vitest'

import type { JSONDoc } from '@shared/lib/db'

import { fromMarkdown, plainTextFromMarkdown } from './fromMarkdown'
import { renderMarkdownToHtml } from './render'
import { toMarkdown } from './toMarkdown'

describe('toMarkdown / fromMarkdown', () => {
  it('round-trips headings, lists, quote, code, hr, and links', () => {
    const doc: JSONDoc = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Title' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'See ' },
            {
              type: 'text',
              text: 'docs',
              marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'One' }],
                },
              ],
            },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'First' }],
                },
              ],
            },
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Done' }],
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Todo' }],
                },
              ],
            },
          ],
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Quoted' }],
            },
          ],
        },
        {
          type: 'codeBlock',
          attrs: { language: 'js' },
          content: [{ type: 'text', text: 'const x = 1' }],
        },
        { type: 'horizontalRule' },
      ],
    }

    const markdown = toMarkdown(doc)

    expect(markdown).toContain('# Title')
    expect(markdown).toContain('[docs](https://example.com)')
    expect(markdown).toContain('- One')
    expect(markdown).toContain('1. First')
    expect(markdown).toContain('- [x] Done')
    expect(markdown).toContain('- [ ] Todo')
    expect(markdown).toContain('> Quoted')
    expect(markdown).toContain('```js')
    expect(markdown).toContain('---')

    const back = fromMarkdown(markdown)
    expect(back.type).toBe('doc')
    expect(back.content?.some((n) => n.type === 'heading')).toBe(true)
    expect(back.content?.some((n) => n.type === 'codeBlock')).toBe(true)
    expect(back.content?.some((n) => n.type === 'horizontalRule')).toBe(true)
  })

  it('parses markdown headings and paragraphs', () => {
    const doc = fromMarkdown('# Hello\n\nWorld')
    expect(doc.content?.[0]).toMatchObject({
      type: 'heading',
      attrs: { level: 1 },
    })
    expect(doc.content?.[1]).toMatchObject({ type: 'paragraph' })
  })
})

describe('plainTextFromMarkdown', () => {
  it('strips markdown syntax', () => {
    expect(plainTextFromMarkdown('# Title\n\n- item')).toContain('Title')
    expect(plainTextFromMarkdown('[link](https://x.test)')).toBe('link')
  })
})

describe('renderMarkdownToHtml', () => {
  it('returns sanitized HTML', () => {
    const html = renderMarkdownToHtml('# Hi\n\n<script>alert(1)</script>')
    expect(html).toContain('<h1>')
    expect(html).not.toContain('<script>')
  })
})
