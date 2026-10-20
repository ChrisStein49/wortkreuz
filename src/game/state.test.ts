import { describe, expect, it } from 'vitest'
import { unpackPuzzle } from '../core/codec.ts'
import { initialState, MAX_HINTS, reduce, tileLetter, type Action, type PlayState } from './state.ts'

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
    expect(both.wrong).toBe(false)
  })

  it('flags a complete but wrong solution', () => {
    // swap N and A in the word: NAUGRN
    const s = run([...assignAll(), ...[1, 0, 2, 3, 4, 5].map((tile) => ({ type: 'tapTile', tile }) as Action)])
    expect(s.solved).toBe(false)
    expect(s.wrong).toBe(true)
  })

  it('swaps two laid letters in one move and returns a letter on second tap', () => {
    let s = run([...assignAll(), ...[1, 0, 2, 3, 4, 5].map((tile) => ({ type: 'tapTile', tile }) as Action)])
    s = run([{ type: 'tapSlot', slot: 0 }, { type: 'tapSlot', slot: 1 }], s)
    expect(s.slots.slice(0, 2)).toEqual([0, 1])
    // NAUGRN -> ANUGRN, still wrong (needs UNGARN) but swapped correctly
    s = run([{ type: 'tapSlot', slot: 2 }, { type: 'tapSlot', slot: 2 }], s)
    expect(s.slots[2]).toBeNull()
    expect(s.wrong).toBe(false)
  })

  it('shows tile letters once their symbol is assigned', () => {
    const s = run([{ type: 'select', symbol: 3 }, { type: 'assign', letter: 'A' }])
    expect(tileLetter(P, s, 0)).toBe('A')
    expect(tileLetter(P, s, 1)).toBeNull()
  })

  it('hints strike unused letters, prefer placed wrong ones, and stop after three', () => {
    let s = run([{ type: 'select', symbol: 0 }, { type: 'assign', letter: 'X' }])
    s = run([{ type: 'hint', random: () => 0 }], s)
    expect(s.struck).toEqual(['X'])
    expect(s.assign[0]).toBeNull()
    for (let i = 0; i < 5; i++) s = run([{ type: 'hint', random: () => 0.5 }], s)
    expect(s.hintsUsed).toBe(MAX_HINTS)
    expect(s.struck).toHaveLength(MAX_HINTS)
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
