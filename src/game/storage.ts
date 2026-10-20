// Progress per puzzle in localStorage, keyed by date and position. Storage can
// be unavailable (private mode, blocked site data); the game then simply
// doesn't remember progress.
import type { SavedProgress } from './state.ts'

const PREFIX = 'wortkreuz:v1:'
const key = (date: string, index: number) => `${PREFIX}${date}:${index}`

export function loadProgress(date: string, index: number): SavedProgress | null {
  try {
    const raw = localStorage.getItem(key(date, index))
    return raw ? (JSON.parse(raw) as SavedProgress) : null
  } catch {
    return null
  }
}

/** Number of solved puzzles on a day */
export function solvedCount(date: string, puzzlesPerDay: number): number {
  let n = 0
  for (let i = 0; i < puzzlesPerDay; i++) if (loadProgress(date, i)?.solved) n++
  return n
}

const RULES_SEEN = `${PREFIX}rulesSeen`

export function rulesSeen(): boolean {
  try {
    return localStorage.getItem(RULES_SEEN) === '1'
  } catch {
    return true // can't remember it anyway: don't show the rules every time
  }
}

export function markRulesSeen() {
  try {
    localStorage.setItem(RULES_SEEN, '1')
  } catch {
    // ignore
  }
}

export function saveProgress(date: string, index: number, progress: SavedProgress) {
  try {
    localStorage.setItem(key(date, index), JSON.stringify(progress))
  } catch {
    // not fatal: progress just isn't kept
  }
}
