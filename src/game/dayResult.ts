// The day's combined result: what gets shared once all puzzles are solved.
import type { Difficulty } from '../core/schedule.ts'
import type { SavedProgress } from './state.ts'

export interface DayResult {
  levels: readonly Difficulty[]
  solved: number
  total: number
  allSolved: boolean
  /** Sum over solved puzzles */
  totalMs: number
  hints: number
}

export function dayResult(levels: readonly Difficulty[], progress: readonly (SavedProgress | null)[]): DayResult {
  const solved = progress.filter((p) => p?.solved)
  return {
    levels,
    solved: solved.length,
    total: levels.length,
    allSolved: solved.length === levels.length,
    // whole seconds per puzzle, so the total matches the times the player saw
    totalMs: solved.reduce((ms, p) => ms + Math.floor(p!.elapsedMs / 1000) * 1000, 0),
    hints: solved.reduce((n, p) => n + p!.hintsUsed, 0),
  }
}
