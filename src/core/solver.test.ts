import { describe, expect, it } from 'vitest'
import words5 from '../../data/de/words5.json'
import { CLASSIC_5 } from './grid.ts'
import { countSolutions, deduce, solveByForcedWords, type Pattern } from './solver.ts'

const VALID = words5.map((e) => e.word)

// The newsletter example: PRINZ/NOMEN/KANTE across, PANIK/IMMUN/ZUNGE down.
// Symbols: 0=R 1=I 2=N 3=A 4=U 5=G 6=K
const R = 0, I = 1, N = 2, A = 3, U = 4, G = 5, K = 6
const _ = null
const EXAMPLE: Pattern = {
  template: CLASSIC_5,
  symbolCount: 7,
  // prettier-ignore
  cells: [
    'P', R,   I,   N,   'Z',
    A,   _,   'M', _,   U,
    N,   'O', 'M', 'E', N,
    I,   _,   U,   _,   G,
    K,   A,   N,   'T', 'E',
  ],
}

describe('solver', () => {
  it('finds exactly one solution for the newsletter example', () => {
    expect(countSolutions(EXAMPLE, VALID)).toBe(1)
  })

  it('reports how far word-by-word filling gets', () => {
    const alphabet = [...'ABCDFGHIJKLNQRSUVWXY']
    const r = solveByForcedWords(EXAMPLE, VALID, alphabet)
    expect(r.filled).toBeGreaterThan(0)
    expect(r.filled).toBeLessThanOrEqual(6)
  })

  it('elimination solves the example with the full alphabet', () => {
    const alphabet = [...'ABCDFGHIJKLNQRSUVWXY'] // A-Z minus printed P Z M O E T
    const result = deduce(EXAMPLE, VALID, alphabet)
    expect(result.domains).toEqual([['R'], ['I'], ['N'], ['A'], ['U'], ['G'], ['K']])
    expect(result.solved).toBe(true)
  })
})
