import { describe, expect, it } from 'vitest'

import { getHighlightSegments } from './highlight'

describe('getHighlightSegments', () => {
  it('returns plain text when query is empty', () => {
    expect(getHighlightSegments('Hello', '')).toEqual([{ text: 'Hello', match: false }])
  })

  it('marks matching segments without HTML', () => {
    expect(getHighlightSegments('Hello world', 'wo')).toEqual([
      { text: 'Hello ', match: false },
      { text: 'wo', match: true },
      { text: 'rld', match: false },
    ])
  })
})
