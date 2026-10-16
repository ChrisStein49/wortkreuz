// Compact text form of a puzzle for shipping in the app (about 70 bytes):
//   grid|key|tiles|word|category
// grid:  size*size chars, row-major: '.' blocked, A-Z printed, 0-9 symbol
// key:   letter of each symbol, in symbol order
// tiles: solution tiles in display order: 0-9 symbol, A-Z plain letter
import type { Cell, SolutionTile } from './types.ts'

/** What the app needs to play a puzzle (no generator stats) */
export interface PlayPuzzle {
  size: number
  cells: Cell[]
  key: string[]
  solution: { word: string; categoryId: string; tiles: SolutionTile[] }
}

const isDigit = (ch: string) => ch >= '0' && ch <= '9'

export function packPuzzle(p: PlayPuzzle): string {
  const grid = p.cells
    .map((c) => (c.kind === 'blocked' ? '.' : c.kind === 'given' ? c.letter : String(c.symbol)))
    .join('')
  const tiles = p.solution.tiles.map((t) => ('symbol' in t ? String(t.symbol) : t.letter)).join('')
  return [grid, p.key.join(''), tiles, p.solution.word, p.solution.categoryId].join('|')
}

export function unpackPuzzle(packed: string): PlayPuzzle {
  const [grid, key, tiles, word, categoryId] = packed.split('|')
  const size = Math.round(Math.sqrt(grid.length))
  if (size * size !== grid.length || !categoryId) throw new Error(`bad puzzle: ${packed}`)
  return {
    size,
    cells: [...grid].map((ch): Cell =>
      ch === '.' ? { kind: 'blocked' } : isDigit(ch) ? { kind: 'symbol', symbol: Number(ch) } : { kind: 'given', letter: ch },
    ),
    key: [...key],
    solution: {
      word,
      categoryId,
      tiles: [...tiles].map((ch) => (isDigit(ch) ? { symbol: Number(ch) } : { letter: ch })),
    },
  }
}

/** The solved letter of every cell ('' for blocked) */
export function solvedLetters(p: PlayPuzzle): string[] {
  return p.cells.map((c) => (c.kind === 'given' ? c.letter : c.kind === 'symbol' ? p.key[c.symbol] : ''))
}
