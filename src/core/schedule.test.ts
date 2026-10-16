import { describe, expect, it } from 'vitest'
import { dailyDifficulties, PUZZLES_PER_DAY } from './schedule.ts'

describe('dailyDifficulties', () => {
  it('uses the gentler curve on weekdays', () => {
    // Friday 16 October 2026
    expect(dailyDifficulties(new Date(2026, 9, 16))).toEqual(['easy', 'easy', 'medium', 'medium', 'hard'])
  })

  it('uses the harder curve on Saturday and Sunday', () => {
    const harder = ['easy', 'medium', 'medium', 'hard', 'hard']
    expect(dailyDifficulties(new Date(2026, 9, 17))).toEqual(harder)
    expect(dailyDifficulties(new Date(2026, 9, 18))).toEqual(harder)
  })

  it('always has five puzzles', () => {
    for (let d = 12; d <= 18; d++) expect(dailyDifficulties(new Date(2026, 9, d))).toHaveLength(PUZZLES_PER_DAY)
  })
})
