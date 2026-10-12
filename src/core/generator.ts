// Generates letter puzzles: fill the grid with words, pick a solution word
// from a category, turn its letters (plus a few more) into symbols, and
// reveal letters until the grid has exactly one solution.
import type { Template } from './grid.ts'
import { countSolutions, deduce, solveByForcedWords, type Pattern } from './solver.ts'
import type { Category, Cell, Deduction, LetterPuzzle, Level, WordEntry } from './types.ts'

export type Rng = () => number

/** Deterministic PRNG so a seed reproduces a puzzle */
export function mulberry32(seed: number): Rng {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T>(rng: Rng, xs: readonly T[]) => xs[Math.floor(rng() * xs.length)]
function shuffle<T>(rng: Rng, xs: readonly T[]): T[] {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface GeneratorOptions {
  lang: string
  alphabet: readonly string[]
  template: Template
  /** Sorted most frequent first; rank = index among grid words */
  words: readonly WordEntry[]
  categories: readonly Category[]
  /** Only grid words with rank below this are placed (familiarity) */
  maxWordRank: number
  symbols: { min: number; max: number }
  /** Fewest distinct letters printed in the grid */
  minGivenLetters: number
  solutionLength: { min: number; max: number }
  /** Extra wrong letters offered in the picker on top of the symbol letters */
  decoys: { easy: number; medium: number }
  /** Restrict to these category ids (default: all) */
  categoryIds?: readonly string[]
}

interface Prepared {
  opts: GeneratorOptions
  gridWords: string[]
  rank: Map<string, number>
  valid: string[]
  byFirst: Map<string, string[]>
  byOdd: Map<string, string[]> // letters at 0, 2, 4 -> words
  solutions: { category: Category; word: string; letters: Set<string> }[]
}

export function prepare(opts: GeneratorOptions): Prepared {
  const grid = opts.words.filter((w) => w.grid)
  const rank = new Map(grid.map((w, i) => [w.word, i]))
  const gridWords = grid.slice(0, opts.maxWordRank).map((w) => w.word)
  const byFirst = new Map<string, string[]>()
  const byOdd = new Map<string, string[]>()
  for (const w of gridWords) {
    byFirst.set(w[0], [...(byFirst.get(w[0]) ?? []), w])
    const k = w[0] + w[2] + w[4]
    byOdd.set(k, [...(byOdd.get(k) ?? []), w])
  }
  const solutions = opts.categories
    .filter((c) => !opts.categoryIds || opts.categoryIds.includes(c.id))
    .flatMap((category) =>
      category.words
        .filter((w) => w.length >= opts.solutionLength.min && w.length <= opts.solutionLength.max)
        // the anagram must point to one word only within its category
        .filter((w) => !category.words.some((o) => o !== w && sortLetters(o) === sortLetters(w)))
        .map((word) => ({ category, word, letters: new Set(word) })),
    )
  return { opts, gridWords, rank, valid: opts.words.map((w) => w.word), byFirst, byOdd, solutions }
}

const sortLetters = (w: string) => [...w].sort().join('')

/** Fills the classic 5x5 template: rows 0/2/4 and columns 0/2/4 */
function fill(p: Prepared, rng: Rng): string[] | null {
  const row0 = pick(rng, p.gridWords)
  const cols = [0, 2, 4].map((c) => p.byFirst.get(row0[c]))
  if (cols.some((c) => !c)) return null
  const [c0, c2, c4] = cols.map((c) => pick(rng, c!))
  const row2s = p.byOdd.get(c0[2] + c2[2] + c4[2])
  const row4s = p.byOdd.get(c0[4] + c2[4] + c4[4])
  if (!row2s || !row4s) return null
  const row2 = pick(rng, row2s)
  const row4 = pick(rng, row4s)
  const all = [row0, row2, row4, c0, c2, c4]
  return new Set(all).size === 6 ? all : null
}

function gridLetters(t: Template, words: string[]): string[] {
  const cells: string[] = new Array(t.size * t.size).fill('')
  t.slots.forEach((slot, i) => slot.forEach((cell, k) => (cells[cell] = words[i][k])))
  return cells
}

/** Tries once from the RNG's current state; null if this attempt fails */
export function tryGenerate(p: Prepared, rng: Rng, id: string): LetterPuzzle | null {
  const { opts } = p
  const t = opts.template
  const words = fill(p, rng)
  if (!words) return null
  const letters = gridLetters(t, words)
  const distinct = new Set(letters.filter(Boolean))

  const fitting = p.solutions.filter(
    (s) => s.letters.size <= opts.symbols.max && [...s.letters].every((l) => distinct.has(l)),
  )
  if (fitting.length === 0) return null
  // Pick a category first so big categories (countries) don't crowd out the rest
  const category = pick(rng, [...new Set(fitting.map((s) => s.category))])
  const sol = pick(rng, fitting.filter((s) => s.category === category))

  const maxSymbols = Math.min(opts.symbols.max, distinct.size - opts.minGivenLetters)
  if (sol.letters.size > maxSymbols) return null
  const target = Math.min(maxSymbols, opts.symbols.min + Math.floor(rng() * (opts.symbols.max - opts.symbols.min + 1)))
  const symbolLetters = new Set(sol.letters)
  const extras = shuffle(rng, [...distinct].filter((l) => !symbolLetters.has(l)))
  while (symbolLetters.size < target && extras.length) symbolLetters.add(extras.pop()!)

  // Reveal non-solution letters until the grid has exactly one solution
  for (;;) {
    if (symbolLetters.size < opts.symbols.min) return null
    const pattern = toPattern(t, letters, symbolLetters)
    // every word needs at least one symbol, otherwise it is a freebie
    if (t.slots.some((slot) => slot.every((c) => typeof pattern.cells[c] === 'string'))) return null
    const n = countSolutions(pattern, p.valid, 2)
    if (n === 1) return finish(p, rng, id, words, letters, symbolLetters, sol)
    if (n === 0) throw new Error(`no solution for ${words.join(' ')}`)
    const revealable = [...symbolLetters].filter((l) => !sol.letters.has(l))
    if (revealable.length === 0) return null
    symbolLetters.delete(pick(rng, revealable))
  }
}

function toPattern(t: Template, letters: string[], symbolLetters: Set<string>, order?: string[]): Pattern {
  const index = new Map((order ?? [...symbolLetters].sort()).map((l, i) => [l, i]))
  return {
    template: t,
    symbolCount: index.size,
    cells: letters.map((l, i) => (t.blocked.has(i) ? null : symbolLetters.has(l) ? index.get(l)! : l)),
  }
}

function finish(
  p: Prepared,
  rng: Rng,
  id: string,
  words: string[],
  letters: string[],
  symbolLetters: Set<string>,
  sol: Prepared['solutions'][number],
): LetterPuzzle {
  const { opts } = p
  const t = opts.template
  // Random symbol numbering, so symbol (= colour) never hints at the letter
  const key = shuffle(rng, [...symbolLetters])
  const pattern = toPattern(t, letters, symbolLetters, key)
  const symbolOf = new Map(key.map((l, i) => [l, i]))

  const cells: Cell[] = pattern.cells.map((c) =>
    c === null ? { kind: 'blocked' } : typeof c === 'string' ? { kind: 'given', letter: c } : { kind: 'symbol', symbol: c },
  )
  const given = new Set(letters.filter((l) => l && !symbolLetters.has(l)))
  const pool = opts.alphabet.filter((l) => !given.has(l))
  const wrong = shuffle(rng, pool.filter((l) => !symbolLetters.has(l)))
  const sorted = (xs: string[]) => [...xs].sort()
  const options: Record<Level, string[]> = {
    easy: sorted([...key, ...wrong.slice(0, opts.decoys.easy)]),
    medium: sorted([...key, ...wrong.slice(0, opts.decoys.medium)]),
    hard: sorted(pool),
  }

  let display = shuffle(rng, [...sol.word])
  for (let i = 0; i < 10 && display.join('') === sol.word; i++) display = shuffle(rng, [...sol.word])

  const ranks = words.map((w) => p.rank.get(w)!)
  const deduction = Object.fromEntries(
    (['easy', 'medium', 'hard'] as const).map((lvl) => {
      const f = solveByForcedWords(pattern, p.valid, options[lvl])
      const e = deduce(pattern, p.valid, options[lvl])
      const d: Deduction = {
        forced: f.solved,
        forcedWords: f.filled,
        openingChoices: f.openingChoices,
        elimination: e.solved,
      }
      return [lvl, d]
    }),
  ) as LetterPuzzle['stats']['deduction']

  return {
    id,
    lang: opts.lang,
    size: t.size,
    cells,
    key,
    solution: {
      categoryId: sol.category.id,
      clue: sol.category.clue,
      word: sol.word,
      symbols: display.map((l) => symbolOf.get(l)!),
    },
    options,
    stats: {
      symbols: key.length,
      givenLetters: given.size,
      maxWordRank: Math.max(...ranks),
      meanWordRank: Math.round(ranks.reduce((a, b) => a + b, 0) / ranks.length),
      deduction,
    },
  }
}

/** Keeps trying until a puzzle comes out (or gives up after `attempts`) */
export function generate(p: Prepared, seed: number, id: string, attempts = 5000): LetterPuzzle | null {
  const rng = mulberry32(seed)
  for (let i = 0; i < attempts; i++) {
    const puzzle = tryGenerate(p, rng, id)
    if (puzzle) return puzzle
  }
  return null
}
