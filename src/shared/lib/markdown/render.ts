/**
 * Markdown → HTML for previews (html disabled in parser, then DOMPurify)
 */
import DOMPurify from 'dompurify'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
})

/** Render Markdown to a sanitized HTML string */
export function renderMarkdownToHtml(markdown: string): string {
  const raw = md.render(markdown)
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
  })
}
