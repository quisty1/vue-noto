/**
 * Split text into match / non-match segments for search result highlighting
 */
export type HighlightSegment = {
  text: string
  match: boolean
}

export function getHighlightSegments(text: string, searchTerm: string): HighlightSegment[] {
  if (!searchTerm.trim()) {
    return [{ text, match: false }]
  }

  const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      match: part.toLowerCase() === searchTerm.trim().toLowerCase(),
    }))
}
