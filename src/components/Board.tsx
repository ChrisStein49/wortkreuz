import type { PlayPuzzle } from '../core/codec.ts'
import type { PlayState } from '../game/state.ts'
import { Goose, gooseColor } from './Goose.tsx'

interface Props {
  puzzle: PlayPuzzle
  state: PlayState
  onSelect: (symbol: number) => void
}

export function Board({ puzzle, state, onSelect }: Props) {
  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`, gridTemplateRows: `repeat(${puzzle.size}, 1fr)` }}
      role="grid"
    >
      {puzzle.cells.map((c, i) => {
        if (c.kind === 'blocked') return <div key={i} className="cell blocked" />
        if (c.kind === 'given') return <div key={i} className="cell given">{c.letter}</div>
        const letter = state.assign[c.symbol]
        const selected = state.selected === c.symbol
        return (
          <button
            key={i}
            type="button"
            className={`cell symbol${selected ? ' selected' : ''}${letter ? ' filled' : ''}`}
            onClick={() => !state.solved && onSelect(c.symbol)}
            aria-label={letter ? `Gans: ${letter}` : 'Gans'}
            aria-pressed={selected}
          >
            {letter ? (
              <>
                <span className="cell-letter" style={{ color: gooseColor(c.symbol) }}>{letter}</span>
                <Goose symbol={c.symbol} className="badge" />
              </>
            ) : (
              <Goose symbol={c.symbol} />
            )}
          </button>
        )
      })}
    </div>
  )
}
