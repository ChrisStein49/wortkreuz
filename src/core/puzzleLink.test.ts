import { describe, expect, it } from 'vitest'
import { parsePuzzleLink, puzzleLinkUrl } from './puzzleLink.ts'

const parse = (hash: string) => parsePuzzleLink(hash, '2026-11-24', '2026-10-16', 5)

describe('puzzle links', () => {
  it('opens a puzzle of today or an earlier day', () => {
    expect(parse('#2026-11-24/2')).toEqual({ iso: '2026-11-24', index: 1 })
    expect(parse('#2026-11-17/5')).toEqual({ iso: '2026-11-17', index: 4 })
    expect(parse('#2026-10-16/1')).toEqual({ iso: '2026-10-16', index: 0 })
  })

  it('ignores days ahead, before the calendar, and invalid links', () => {
    expect(parse('#2026-11-25/2')).toBeNull() // tomorrow: no playing ahead
    expect(parse('#2026-10-15/1')).toBeNull() // before the calendar starts
    expect(parse('#2026-11-24/0')).toBeNull()
    expect(parse('#2026-11-24/6')).toBeNull()
    expect(parse('#2026-02-30/1')).toBeNull() // no such day
    expect(parse('#puzzle2')).toBeNull()
    expect(parse('')).toBeNull()
  })

  it('builds the link for the newsletter', () => {
    expect(puzzleLinkUrl('https://geschnatter.ganzgraz.at', '2026-11-24', 1)).toBe('https://geschnatter.ganzgraz.at/#2026-11-24/2')
    expect(puzzleLinkUrl('https://wortkreuz.netlify.app/', '2026-11-24', 0)).toBe('https://wortkreuz.netlify.app/#2026-11-24/1')
  })
})
