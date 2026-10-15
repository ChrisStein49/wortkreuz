// Language-independent puzzle model. A language pack supplies the alphabet,
// word list and solution categories; nothing in core/ knows about German.

export interface Category {
  id: string
  /** Question shown with the solution geese, e.g. "Welches Land ist gesucht?" */
  clue: string
  words: readonly string[]
  /** Few members: the anagram is quick to spot */
  easy?: boolean
}

export interface WordEntry {
  word: string
  freq: number
  /** May be placed in a grid (otherwise only counts as a valid word) */
  grid: boolean
}

/** Cell content of a published puzzle */
export type Cell =
  | { kind: 'blocked' }
  | { kind: 'given'; letter: string }
  | { kind: 'symbol'; symbol: number }

export interface LetterPuzzle {
  id: string
  lang: string
  size: number
  /** Row-major, size*size */
  cells: Cell[]
  /** Answer for each symbol index */
  key: string[]
  solution: {
    categoryId: string
    clue: string
    word: string
    /** Symbols shown under the clue, in shuffled display order */
    symbols: number[]
  }
  /**
   * Letters offered in the picker: the alphabet minus the printed letters.
   * The app's hint can remove letters not in `key` from this set.
   */
  picker: string[]
  stats: PuzzleStats
}

export interface Deduction {
  /** Solvable by filling words that are the only fit, one after another */
  forced: boolean
  /** Words filled that way before getting stuck (6 = solved) */
  forcedWords: number
  /** Fewest words fitting any slot at the start (1 = obvious entry point) */
  openingChoices: number
  /** Solvable by letter elimination across all words (stronger than forced) */
  elimination: boolean
}

export interface PuzzleStats {
  symbols: number
  /** Distinct printed letters */
  givenLetters: number
  /** Printed cells (a letter printed twice counts twice) */
  givenCells: number
  /** Rarest grid word's rank in the frequency list (0 = most common) */
  maxWordRank: number
  meanWordRank: number
  /** How the puzzle can be solved with the full picker */
  deduction: Deduction
}
