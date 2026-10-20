import { describe, expect, it } from 'vitest'
import { UI } from '../lang/de/ui.ts'
import { dayResult } from './dayResult.ts'
import type { SavedProgress } from './state.ts'

const done = (elapsedMs: number, hintsUsed: number): SavedProgress => ({
  assign: [], struck: [], slots: [], elapsedMs, hintsUsed, solved: true,
})
const LEVELS = ['easy', 'easy', 'medium', 'medium', 'hard'] as const

describe('dayResult', () => {
  it('adds up time and hints of solved puzzles only', () => {
    const open: SavedProgress = { ...done(60_000, 3), solved: false }
    const r = dayResult(LEVELS, [done(72_000, 0), done(125_000, 1), open, null, done(250_000, 1)])
    expect(r).toMatchObject({ solved: 3, allSolved: false, totalMs: 447_000, hints: 2 })
  })

  it('totals the displayed whole seconds, not hidden fractions', () => {
    // 0:01 + 0:01 + 0:01 shown, although the raw sum is 3.6 s
    const r = dayResult(['easy', 'easy', 'medium'], [done(1_200, 0), done(1_200, 0), done(1_200, 0)])
    expect(r.totalMs).toBe(3_000)
  })

  it('builds the day share text once all five are solved', () => {
    const r = dayResult(LEVELS, [done(72_000, 0), done(125_000, 1), done(150_000, 0), done(98_000, 0), done(137_000, 1)])
    expect(r.allSolved).toBe(true)
    expect(UI.shareDay('20.10.', r)).toBe('Wortkreuz 20.10.\n🟩🟩🟨🟨🟥 5/5\n⏱ 9:42 · 💡 2 Tipps')
  })
})
