// Solver for symbol-substitution word grids. Rules: each symbol stands for
// one letter, different symbols for different letters, no symbol for a
// letter that is printed in the grid, and every slot must be a valid word.
import type { Template } from './grid.ts'

/** Per cell: a printed letter, a symbol index, or null for blocked */
export type PatternCell = string | number | null

export interface Pattern {
  template: Template
  cells: PatternCell[]
  symbolCount: number
}

type Slot = { symbolAt: (number | null)[]; candidates: string[] }

function givenLetters(p: Pattern) {
  return new Set(p.cells.filter((c): c is string => typeof c === 'string'))
}

// Words that fit a slot's printed letters and its internal symbol pattern
// (repeat symbol = repeat letter, distinct symbols = distinct letters).
function buildSlots(p: Pattern, words: readonly string[]): Slot[] {
  const given = givenLetters(p)
  return p.template.slots.map((cellIdx) => {
    const pat = cellIdx.map((i) => p.cells[i])
    const symbolAt = pat.map((c) => (typeof c === 'number' ? c : null))
    const candidates = words.filter((w) => {
      const seen = new Map<number, string>()
      for (let k = 0; k < pat.length; k++) {
        const c = pat[k]
        if (typeof c === 'string') {
          if (w[k] !== c) return false
        } else if (typeof c === 'number') {
          if (given.has(w[k])) return false
          const prev = seen.get(c)
          if (prev === undefined) {
            for (const v of seen.values()) if (v === w[k]) return false
            seen.set(c, w[k])
          } else if (prev !== w[k]) return false
        }
      }
      return true
    })
    return { symbolAt, candidates }
  })
}

function fits(word: string, slot: Slot, assign: (string | undefined)[], used: Map<string, number>) {
  for (let k = 0; k < word.length; k++) {
    const s = slot.symbolAt[k]
    if (s === null) continue
    const a = assign[s]
    if (a !== undefined ? a !== word[k] : (used.get(word[k]) ?? s) !== s) return false
  }
  return true
}

/** Counts solutions, stopping at `limit`. */
export function countSolutions(p: Pattern, words: readonly string[], limit = 2): number {
  const slots = buildSlots(p, words)
  const assign: (string | undefined)[] = new Array(p.symbolCount).fill(undefined)
  const used = new Map<string, number>() // letter -> symbol
  const done = new Array(slots.length).fill(false)
  let count = 0

  function search(): void {
    // Most constrained open slot first
    let best = -1
    let bestFits: string[] = []
    for (let i = 0; i < slots.length; i++) {
      if (done[i]) continue
      const f = slots[i].candidates.filter((w) => fits(w, slots[i], assign, used))
      if (f.length === 0) return
      if (best === -1 || f.length < bestFits.length) {
        best = i
        bestFits = f
      }
    }
    if (best === -1) {
      count++
      return
    }
    done[best] = true
    const slot = slots[best]
    for (const w of bestFits) {
      const added: number[] = []
      for (let k = 0; k < w.length; k++) {
        const s = slot.symbolAt[k]
        if (s !== null && assign[s] === undefined) {
          assign[s] = w[k]
          used.set(w[k], s)
          added.push(s)
        }
      }
      search()
      for (const s of added) {
        used.delete(assign[s]!)
        assign[s] = undefined
      }
      if (count >= limit) break
    }
    done[best] = false
  }

  search()
  return count
}

/**
 * The simplest way to solve: repeatedly find a word that is the only one
 * still fitting its slot, fill it in, and carry on. Returns how many words
 * get filled that way and how many candidates the best opening slot had.
 */
export function solveByForcedWords(p: Pattern, words: readonly string[], domain: readonly string[]) {
  const allowed = new Set(domain)
  const slots = buildSlots(p, words)
  for (const slot of slots)
    slot.candidates = slot.candidates.filter((w) => slot.symbolAt.every((s, k) => s === null || allowed.has(w[k])))
  const assign: (string | undefined)[] = new Array(p.symbolCount).fill(undefined)
  const used = new Map<string, number>()
  const done = new Array(slots.length).fill(false)
  const openingChoices = Math.min(...slots.map((s) => s.candidates.length))
  let filled = 0
  for (let progress = true; progress; ) {
    progress = false
    for (let i = 0; i < slots.length; i++) {
      if (done[i]) continue
      const f = slots[i].candidates.filter((w) => fits(w, slots[i], assign, used))
      if (f.length !== 1) continue
      done[i] = true
      filled++
      progress = true
      slots[i].symbolAt.forEach((s, k) => {
        if (s !== null && assign[s] === undefined) {
          assign[s] = f[0][k]
          used.set(f[0][k], s)
        }
      })
    }
  }
  return { solved: filled === slots.length, filled, openingChoices }
}

/**
 * Human-style elimination: look at one word at a time, keep only the letters
 * each symbol can still take, and drop letters already pinned to another
 * symbol. Repeats until nothing changes. `domain` is the picker's letter set.
 */
export function deduce(p: Pattern, words: readonly string[], domain: readonly string[]) {
  const slots = buildSlots(p, words)
  const doms = Array.from({ length: p.symbolCount }, () => new Set(domain))
  let rounds = 0
  for (let changed = true; changed; ) {
    changed = false
    rounds++
    for (const slot of slots) {
      slot.candidates = slot.candidates.filter((w) =>
        slot.symbolAt.every((s, k) => s === null || doms[s].has(w[k])),
      )
      const seen = new Map<number, Set<string>>()
      slot.symbolAt.forEach((s, k) => {
        if (s === null) return
        if (!seen.has(s)) seen.set(s, new Set())
        for (const w of slot.candidates) seen.get(s)!.add(w[k])
      })
      for (const [s, letters] of seen)
        for (const l of [...doms[s]])
          if (!letters.has(l)) {
            doms[s].delete(l)
            changed = true
          }
    }
    for (let s = 0; s < doms.length; s++) {
      if (doms[s].size !== 1) continue
      const [l] = doms[s]
      for (let t = 0; t < doms.length; t++)
        if (t !== s && doms[t].delete(l)) changed = true
    }
  }
  const solved = doms.every((d) => d.size === 1)
  return { solved, rounds, domains: doms.map((d) => [...d].sort()) }
}
