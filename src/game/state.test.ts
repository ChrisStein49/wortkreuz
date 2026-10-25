import { describe, expect, it } from 'vitest'
import { unpackPuzzle } from '../core/codec.ts'
import { correctWordCells, initialState, MAX_HINTS, reduce, tileLetter, wordSlots, type Action, type PlayState } from './state.ts'

// Newsletter example: 0=R 1=I 2=N 3=A 4=U 5=G 6=K; tiles A N U G R N
const P = unpackPuzzle('P012Z3.M.42OME21.4.5632TE|RINAUGK|324502|UNGARN|country')
const run = (actions: Action[], s: PlayState = initialState(P)) => actions.reduce((st, a) => reduce(P, st, a), s)
const assignAll = (): Action[] => [...P.key].flatMap((l, symbol) => [{ type: 'select', symbol }, { type: 'assign', letter: l }] as Action[])
// UNGARN from tiles [A0 N1 U2 G3 R4 N5]
const layWord = (): Action[] => [2, 1, 3, 0, 4, 5].map((tile) => ({ type: 'tapTile', tile }) as Action)

describe('play state', () => {
  it('assigns a letter to the selected symbol and closes the picker', () => {
    const s = run([{ type: 'select', symbol: 0 }, { type: 'assign', letter: 'R' }])
    expect(s.assign[0]).toBe('R')
    expect(s.selected).toBeNull()
  })

  it('moves a letter that another symbol already has', () => {
    const s = run([
      { type: 'select', symbol: 0 },
      { type: 'assign', letter: 'R' },
      { type: 'select', symbol: 1 },
      { type: 'assign', letter: 'R' },
    ])
    expect(s.assign[0]).toBeNull()
    expect(s.assign[1]).toBe('R')
  })

  it('refuses letters printed in the grid', () => {
    const s = run([{ type: 'select', symbol: 0 }, { type: 'assign', letter: 'P' }])
    expect(s.assign[0]).toBeNull()
  })

  it('is solved only when all symbols AND the word are right', () => {
    const wordOnly = run(layWord())
    expect(wordOnly.solved).toBe(false)
    const both = run([...assignAll(), ...layWord()])
    expect(both.solved).toBe(true)
    expect(both.wrongOrder).toBe(false)
  })

  it('flags a wrong order when all letters are right and the word is laid', () => {
    // swap N and A in the word: NAUGRN
    const s = run([...assignAll(), ...[1, 0, 2, 3, 4, 5].map((tile) => ({ type: 'tapTile', tile }) as Action)])
    expect(s.solved).toBe(false)
    expect(s.wrongOrder).toBe(true)
  })

  it('does not flag a wrong letter (the white words show it)', () => {
    // everything filled, word in the right order, but K (symbol 6) wrong
    const s = run([...assignAll(), { type: 'select', symbol: 6 }, { type: 'assign', letter: 'X' }, ...layWord()])
    expect(s.solved).toBe(false)
    expect(s.wrongOrder).toBe(false)
  })

  it('swaps two laid letters in one move and returns a letter on second tap', () => {
    let s = run([...assignAll(), ...[1, 0, 2, 3, 4, 5].map((tile) => ({ type: 'tapTile', tile }) as Action)])
    s = run([{ type: 'tapSlot', slot: 0 }, { type: 'tapSlot', slot: 1 }], s)
    expect(s.slots.slice(0, 2)).toEqual([0, 1])
    // NAUGRN -> ANUGRN, still wrong (needs UNGARN) but swapped correctly
    s = run([{ type: 'tapSlot', slot: 2 }, { type: 'tapSlot', slot: 2 }], s)
    expect(s.slots[2]).toBeNull()
    expect(s.wrongOrder).toBe(false)
  })

  it('opens the picker when tapping a solution goose that has no letter yet', () => {
    // tile 0 is symbol 3 (A), still unassigned
    const s = run([{ type: 'tapTile', tile: 0 }])
    expect(s.selected).toBe(3)
    expect(s.slots.every((t) => t === null)).toBe(true)
  })

  it('lays a solution tile once its goose has a letter', () => {
    const s = run([{ type: 'select', symbol: 3 }, { type: 'assign', letter: 'A' }, { type: 'tapTile', tile: 0 }])
    expect(s.slots[0]).toBe(0)
    expect(s.selected).toBeNull()
  })

  it('takes a laid goose out of the word when it loses its letter', () => {
    // A (symbol 3) laid in slot 0, N (symbol 2, tiles 1 and 5) in slots 1-2
    const laid = run([
      { type: 'select', symbol: 3 }, { type: 'assign', letter: 'A' },
      { type: 'select', symbol: 2 }, { type: 'assign', letter: 'N' },
      { type: 'tapTile', tile: 0 }, { type: 'tapTile', tile: 1 }, { type: 'tapTile', tile: 5 },
    ])
    expect(laid.slots.slice(0, 3)).toEqual([0, 1, 5])

    // Reset N: both N tiles leave the word, A stays
    const reset = run([{ type: 'select', symbol: 2 }, { type: 'clear' }], laid)
    expect(reset.slots.slice(0, 3)).toEqual([0, null, null])

    // Moving A to another goose takes the A tile out as well
    const moved = run([{ type: 'select', symbol: 0 }, { type: 'assign', letter: 'A' }], laid)
    expect(moved.slots.slice(0, 3)).toEqual([null, 1, 5])
  })

  it('takes a laid goose out of the word when a hint strikes its letter', () => {
    const s = run([
      { type: 'select', symbol: 3 }, { type: 'assign', letter: 'X' },
      { type: 'tapTile', tile: 0 },
      { type: 'hint', random: () => 0 },
    ])
    expect(s.struck).toContain('X')
    expect(s.slots[0]).toBeNull()
  })

  it('finds the six words of the grid', () => {
    expect(wordSlots(P)).toHaveLength(6)
  })

  it('marks a word green only when all its geese are right', () => {
    // PRINZ (row 0) needs R I N; PANIK (column 0) needs A N I K
    const partial = run([
      { type: 'select', symbol: 0 }, { type: 'assign', letter: 'R' },
      { type: 'select', symbol: 1 }, { type: 'assign', letter: 'I' },
    ])
    expect(correctWordCells(P, partial).size).toBe(0)

    // with N, PRINZ (row 0) is complete – and so is NOMEN (row 2), whose only goose is N
    const prinz = run([{ type: 'select', symbol: 2 }, { type: 'assign', letter: 'N' }], partial)
    expect([...correctWordCells(P, prinz)].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 10, 11, 12, 13, 14])

    // a wrong letter elsewhere doesn't affect PRINZ; a wrong letter in it removes the mark
    const wrongK = run([{ type: 'select', symbol: 6 }, { type: 'assign', letter: 'X' }], prinz)
    expect(correctWordCells(P, wrongK).has(0)).toBe(true)
    const wrongN = run([{ type: 'select', symbol: 2 }, { type: 'assign', letter: 'B' }], prinz)
    expect(correctWordCells(P, wrongN).size).toBe(0)
  })

  it('shows tile letters once their symbol is assigned', () => {
    const s = run([{ type: 'select', symbol: 3 }, { type: 'assign', letter: 'A' }])
    expect(tileLetter(P, s, 0)).toBe('A')
    expect(tileLetter(P, s, 1)).toBeNull()
  })

  // Example puzzle: printed P Z M O E T, correct R I N A U G K, so 13 wrong
  // letters, ranked by frequency: S D H L C B W F V J Y X Q
  it('a hint strikes half of the wrong letters, mixing common and rare ones', () => {
    const s = run([{ type: 'hint', random: () => 0 }])
    expect(s.struck).toEqual(['S', 'H', 'C', 'W', 'V', 'Y', 'Q']) // every other one, 7 of 13
    const other = run([{ type: 'hint', random: () => 0.9 }])
    expect(other.struck).toHaveLength(7) // 6 alternating + 1 more to reach half
    for (const l of [...s.struck, ...other.struck]) expect(P.key).not.toContain(l)
  })

  it('a hint always strikes a wrong letter the player placed', () => {
    const s = run([{ type: 'select', symbol: 0 }, { type: 'assign', letter: 'D' }, { type: 'hint', random: () => 0 }])
    expect(s.struck).toContain('D')
    expect(s.struck).toHaveLength(7)
    expect(s.assign[0]).toBeNull()
  })

  it('three hints leave about one wrong letter and then stop', () => {
    let s = initialState(P)
    for (let i = 0; i < 5; i++) s = run([{ type: 'hint', random: () => 0 }], s)
    expect(s.hintsUsed).toBe(MAX_HINTS)
    expect(s.struck).toHaveLength(12) // 13 → 6 → 3 → 1 wrong letters left
    for (const l of s.struck) expect(P.key).not.toContain(l)
  })

  it('stops the clock and ignores input once solved', () => {
    let s = run([...assignAll(), ...layWord(), { type: 'tick', ms: 1000 }])
    const t = s.elapsedMs
    s = run([{ type: 'tick', ms: 1000 }, { type: 'select', symbol: 0 }], s)
    expect(s.elapsedMs).toBe(t)
    expect(s.selected).toBeNull()
  })
})
