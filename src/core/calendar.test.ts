import { describe, expect, it } from 'vitest'
import daily from '../data/daily-de.json'
import { dayIndex, puzzlesFor, toIsoDate, type Calendar } from './calendar.ts'
import { packPuzzle, solvedLetters, unpackPuzzle } from './codec.ts'

const calendar = daily as Calendar

describe('codec', () => {
  it('round-trips every puzzle of the first week', () => {
    for (const day of calendar.days.slice(0, 7)) for (const packed of day) expect(packPuzzle(unpackPuzzle(packed))).toBe(packed)
  })

  it('decodes the newsletter example', () => {
    // symbols 0=R 1=I 2=N 3=A 4=U 5=G 6=K; hint geese red orange green teal pink orange
    const p = unpackPuzzle('P012Z3.M.42OME21.4.5632TE|RINAUGK|324502|UNGARN|country')
    expect(p.size).toBe(5)
    expect(solvedLetters(p).join('')).toBe('PRINZAMUNOMENIUGKANTE')
    expect(p.solution.tiles).toEqual([{ symbol: 3 }, { symbol: 2 }, { symbol: 4 }, { symbol: 5 }, { symbol: 0 }, { symbol: 2 }])
  })
})

describe('calendar', () => {
  it('counts calendar days across the DST change', () => {
    // Austria switches to winter time on 25 October 2026
    expect(dayIndex('2026-10-16', new Date(2026, 9, 26, 0, 30))).toBe(10)
    expect(dayIndex('2026-10-16', new Date(2026, 9, 16, 23, 59))).toBe(0)
  })

  it('serves five puzzles from the start date and nothing before it', () => {
    const start = new Date(2026, 9, 16)
    expect(toIsoDate(start)).toBe(calendar.start)
    expect(puzzlesFor(calendar, start)).toHaveLength(5)
    expect(puzzlesFor(calendar, new Date(2026, 9, 15))).toBeNull()
  })
})
