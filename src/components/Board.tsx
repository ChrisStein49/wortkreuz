import type { PlayPuzzle } from '../core/codec.ts'
import type { PlayState } from '../game/state.ts'
import { Goose, gooseColor } from './Goose.tsx'

interface Props {
  puzzle: PlayPuzzle
  state: PlayState
  onSelect: (symbol: number) => void
  /** Cells of correctly solved words, shown in green */
  okCells?: ReadonlySet<number>
}

export function Board({ puzzle, state, onSelect, okCells }: Props) {
  return (
    <div
      className="board"
      style={{ gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`, gridTemplateRows: `repeat(${puzzle.size}, 1fr)` }}
      role="grid"
    >
      {puzzle.cells.map((c, i) => {
        if (c.kind === 'blocked') return <div key={i} className="cell blocked" />
        const ok = okCells?.has(i) ? ' ok' : ''
        if (c.kind === 'given') return <div key={i} className={`cell given${ok}`}>{c.letter}</div>
        const letter = state.assign[c.symbol]
        const selected = state.selected === c.symbol
        return (
          <button
            key={i}
            type="button"
            className={`cell symbol${ok}${selected ? ' selected' : ''}${letter ? ' filled' : ''}`}
            onClick={() => !state.solved && onSelect(c.symbol)}
            aria-label={letter ? `Gans: ${letter}` : 'Gans'}
            aria-pressed={selected}
          >
            {/* the letter's colour shows its goose, so no extra goose icon */}
            {letter ? (
              <span className="cell-letter" style={{ color: gooseColor(c.symbol) }}>{letter}</span>
            ) : (
              <Goose symbol={c.symbol} />
            )}
          </button>
        )
      })}
    </div>
  )
}
