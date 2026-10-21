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

// The first-visit card is done once the instructions were opened, skipped or
// the first puzzle solved. (Key name kept from when the rules page opened
// automatically, so players who saw it don't get the card.)
const INTRO_DONE = `${PREFIX}rulesSeen`

export function introDone(): boolean {
  try {
    return localStorage.getItem(INTRO_DONE) === '1'
  } catch {
    return true // can't remember it anyway: don't show the card every time
  }
}

export function markIntroDone() {
  try {
    localStorage.setItem(INTRO_DONE, '1')
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
