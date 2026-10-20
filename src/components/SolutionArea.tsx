import type React from 'react'
import type { PlayPuzzle } from '../core/codec.ts'
import { tileLetter, type PlayState } from '../game/state.ts'
import { Goose, gooseColor } from './Goose.tsx'

interface Props {
  puzzle: PlayPuzzle
  state: PlayState
  clue: string
  onTile: (tile: number) => void
  onSlot: (slot: number) => void
}

export function SolutionArea({ puzzle, state, clue, onTile, onSlot }: Props) {
  const tiles = puzzle.solution.tiles
  const face = (tile: number) => {
    const t = tiles[tile]
    const letter = tileLetter(puzzle, state, tile)
    if ('letter' in t) return <span className="tile-letter plain">{t.letter}</span>
    return letter ? (
      <span className="tile-letter" style={{ color: gooseColor(t.symbol) }}>{letter}</span>
    ) : (
      <Goose symbol={t.symbol} />
    )
  }
  return (
    <div className="solution" style={{ '--n': tiles.length } as React.CSSProperties}>
      <div className="clue">{clue}</div>
      <div className="slots">
        {state.slots.map((tile, i) => (
          <button
            key={i}
            type="button"
            className={`slot${tile === null ? ' empty' : ''}${state.picked === i ? ' picked' : ''}`}
            onClick={() => !state.solved && onSlot(i)}
            aria-label={`Lücke ${i + 1}`}
          >
            {tile !== null && face(tile)}
          </button>
        ))}
      </div>
      <div className="tiles">
        {tiles.map((_, i) => {
          const used = state.slots.includes(i)
          return (
            <button
              key={i}
              type="button"
              className={`tile${used ? ' used' : ''}`}
              disabled={used || state.solved}
              onClick={() => onTile(i)}
            >
              {face(i)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
