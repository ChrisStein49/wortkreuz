// Play state of one letter puzzle as a pure reducer, independent of the UI.
// Solved means every symbol carries its letter AND the solution word is laid
// out correctly, so the word can't be guessed as a shortcut.
import type { PlayPuzzle } from '../core/codec.ts'

export const MAX_HINTS = 3

export interface PlayState {
  /** Letter the player gave each symbol */
  assign: (string | null)[]
  /** Symbol whose letter is being picked (picker open) */
  selected: number | null
  /** Letters removed from the picker by hints */
  struck: string[]
  hintsUsed: number
  /** Solution slots: index into puzzle.solution.tiles, or null if empty */
  slots: (number | null)[]
  /** Slot picked for swapping */
  picked: number | null
  elapsedMs: number
  solved: boolean
  /** Everything filled in but something is wrong */
  wrong: boolean
}

export type Action =
  | { type: 'select'; symbol: number }
  | { type: 'closePicker' }
  | { type: 'assign'; letter: string }
  | { type: 'clear' }
  | { type: 'hint'; random?: () => number }
  | { type: 'tapTile'; tile: number }
  | { type: 'tapSlot'; slot: number }
  | { type: 'tick'; ms: number }

/** Progress worth keeping between sessions */
export type SavedProgress = Pick<PlayState, 'assign' | 'struck' | 'hintsUsed' | 'slots' | 'elapsedMs' | 'solved'>

export function initialState(p: PlayPuzzle, saved?: SavedProgress | null): PlayState {
  const fresh: PlayState = {
    assign: p.key.map(() => null),
    selected: null,
    struck: [],
    hintsUsed: 0,
    slots: p.solution.tiles.map(() => null),
    picked: null,
    elapsedMs: 0,
    solved: false,
    wrong: false,
  }
  if (!saved || saved.assign.length !== p.key.length || saved.slots.length !== p.solution.tiles.length) return fresh
  return { ...fresh, ...saved }
}

export function givenLetters(p: PlayPuzzle): Set<string> {
  return new Set(p.cells.flatMap((c) => (c.kind === 'given' ? [c.letter] : [])))
}

/** Letter shown on a solution tile, or null while its symbol is unsolved */
export function tileLetter(p: PlayPuzzle, s: PlayState, tile: number): string | null {
  const t = p.solution.tiles[tile]
  return 'symbol' in t ? s.assign[t.symbol] : t.letter
}

/** Which symbol currently holds each letter */
export function letterOwners(s: PlayState): Map<string, number> {
  const m = new Map<string, number>()
  s.assign.forEach((l, i) => l && m.set(l, i))
  return m
}

function settle(p: PlayPuzzle, st: PlayState): PlayState {
  // Only geese with a letter may sit in the word: one that lost its letter
  // (reset, hint, letter moved to another goose) goes back to the tiles
  const keep = (tile: number | null) => {
    if (tile === null) return true
    const t = p.solution.tiles[tile]
    return !('symbol' in t) || st.assign[t.symbol] !== null
  }
  const s: PlayState = st.slots.every(keep)
    ? st
    : {
        ...st,
        slots: st.slots.map((t) => (keep(t) ? t : null)),
        picked: st.picked !== null && keep(st.slots[st.picked]) ? st.picked : null,
      }
  const allAssigned = s.assign.every((l) => l !== null)
  const allLaid = s.slots.every((t) => t !== null)
  if (!allAssigned || !allLaid) return { ...s, wrong: false }
  const keyOk = s.assign.every((l, i) => l === p.key[i])
  const word = s.slots.map((t) => tileLetter(p, s, t!)).join('')
  const solved = keyOk && word === p.solution.word
  return { ...s, solved, wrong: !solved, selected: solved ? null : s.selected, picked: solved ? null : s.picked }
}

export function reduce(p: PlayPuzzle, s: PlayState, a: Action): PlayState {
  if (s.solved && a.type !== 'tick') return s
  switch (a.type) {
    case 'select':
      return { ...s, selected: s.selected === a.symbol ? null : a.symbol, picked: null }
    case 'closePicker':
      return { ...s, selected: null }
    case 'assign': {
      if (s.selected === null || givenLetters(p).has(a.letter) || s.struck.includes(a.letter)) return s
      // a letter can belong to one symbol only: move it here
      const assign = s.assign.map((l) => (l === a.letter ? null : l))
      assign[s.selected] = a.letter
      return settle(p, { ...s, assign, selected: null })
    }
    case 'clear': {
      if (s.selected === null) return s
      const assign = [...s.assign]
      assign[s.selected] = null
      return settle(p, { ...s, assign, selected: null })
    }
    case 'hint': {
      if (s.hintsUsed >= MAX_HINTS) return s
      const given = givenLetters(p)
      const used = new Set(p.key)
      const owners = letterOwners(s)
      const candidates = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].filter((l) => !given.has(l) && !used.has(l) && !s.struck.includes(l))
      if (candidates.length === 0) return s
      // Prefer striking a wrong letter the player has already placed: that helps most
      const placed = candidates.filter((l) => owners.has(l))
      const pool = placed.length ? placed : candidates
      const letter = pool[Math.floor((a.random ?? Math.random)() * pool.length)]
      const assign = s.assign.map((l) => (l === letter ? null : l))
      return settle(p, { ...s, assign, struck: [...s.struck, letter], hintsUsed: s.hintsUsed + 1 })
    }
    case 'tapTile': {
      if (s.slots.includes(a.tile)) return s
      // A goose without a letter behaves like the geese in the grid: tapping
      // it opens the letter picker for its colour instead of laying it
      const t = p.solution.tiles[a.tile]
      if ('symbol' in t && s.assign[t.symbol] === null) return { ...s, selected: t.symbol, picked: null }
      const target = s.picked !== null && s.slots[s.picked] === null ? s.picked : s.slots.indexOf(null)
      if (target < 0) return s
      const slots = [...s.slots]
      slots[target] = a.tile
      return settle(p, { ...s, slots, picked: null, selected: null })
    }
    case 'tapSlot': {
      const slots = [...s.slots]
      if (s.picked === null) {
        // pick a filled slot for swapping (empty slots: nothing to do)
        return slots[a.slot] === null ? s : { ...s, picked: a.slot, selected: null }
      }
      if (s.picked === a.slot) {
        // tapping the picked letter again returns it to the tiles
        slots[a.slot] = null
        return settle(p, { ...s, slots, picked: null })
      }
      // swap (or move into an empty slot)
      ;[slots[s.picked], slots[a.slot]] = [slots[a.slot], slots[s.picked]]
      return settle(p, { ...s, slots, picked: null })
    }
    case 'tick':
      return s.solved ? s : { ...s, elapsedMs: s.elapsedMs + a.ms }
  }
}

export function toSaved(s: PlayState): SavedProgress {
  const { assign, struck, hintsUsed, slots, elapsedMs, solved } = s
  return { assign, struck, hintsUsed, slots, elapsedMs, solved }
}
