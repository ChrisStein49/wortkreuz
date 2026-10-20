import { describe, expect, it } from 'vitest'
import { currentStreak } from './streak.ts'

const TODAY = new Date(2026, 9, 20, 15, 0)
const FIRST = '2026-10-01'
const solved = (map: Record<string, number>) => (iso: string) => map[iso] ?? 0

describe('currentStreak', () => {
  it('counts consecutive days with at least 3 solved, including today', () => {
    expect(currentStreak(TODAY, solved({ '2026-10-20': 5, '2026-10-19': 3, '2026-10-18': 4, '2026-10-16': 5 }), FIRST)).toBe(3)
  })

  it('does not break while today is still under 3', () => {
    expect(currentStreak(TODAY, solved({ '2026-10-20': 2, '2026-10-19': 5, '2026-10-18': 3 }), FIRST)).toBe(2)
  })

  it('is broken by a day with fewer than 3', () => {
    expect(currentStreak(TODAY, solved({ '2026-10-20': 5, '2026-10-19': 2, '2026-10-18': 5 }), FIRST)).toBe(1)
    expect(currentStreak(TODAY, solved({}), FIRST)).toBe(0)
  })

  it('stops at the calendar start', () => {
    expect(currentStreak(TODAY, () => 5, '2026-10-16')).toBe(5)
  })

  it('handles month boundaries', () => {
    expect(currentStreak(new Date(2026, 10, 1), solved({ '2026-11-01': 3, '2026-10-31': 3, '2026-10-30': 3 }), FIRST)).toBe(3)
  })
})
