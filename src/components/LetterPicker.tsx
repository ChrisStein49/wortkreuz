import type { PlayPuzzle } from '../core/codec.ts'
import { givenLetters, letterOwners, MAX_HINTS, type PlayState } from '../game/state.ts'
import { UI } from '../lang/de/ui.ts'
import { Goose, gooseColor } from './Goose.tsx'

// German phone layout
const ROWS = ['QWERTZUIOP', 'ASDFGHJKL', 'YXCVBNM']

interface Props {
  puzzle: PlayPuzzle
  state: PlayState
  onLetter: (letter: string) => void
  onClear: () => void
  onHint: () => void
  onClose: () => void
}

export function LetterPicker({ puzzle, state, onLetter, onClear, onHint, onClose }: Props) {
  if (state.selected === null) return null
  const given = givenLetters(puzzle)
  const owners = letterOwners(state)
  const hintsLeft = MAX_HINTS - state.hintsUsed
  return (
    <>
      {/* no backdrop: tapping another goose switches directly; PlayScreen closes on taps elsewhere */}
      <div className="sheet" role="dialog" aria-label={UI.whichLetter}>
        <div className="sheet-grab" onClick={onClose} />
        <div className="sheet-head">
          <Goose symbol={state.selected} className="sheet-goose" />
          <span className="grow">{UI.whichLetter}</span>
          <button type="button" className="hint-btn" onClick={onHint} disabled={hintsLeft === 0} title={UI.hintTitle}>
            💡 {UI.hint(hintsLeft)}
          </button>
        </div>
        <div className="keys">
          {ROWS.map((row, r) => (
            <div className="key-row" key={row}>
              {[...row].map((l) => {
                const owner = owners.get(l)
                const disabled = given.has(l) || state.struck.includes(l)
                const cls = given.has(l) ? 'given' : state.struck.includes(l) ? 'struck' : owner !== undefined ? 'taken' : ''
                return (
                  <button
                    key={l}
                    type="button"
                    className={`key ${cls}${owner === state.selected ? ' current' : ''}`}
                    style={owner !== undefined && !disabled ? { background: gooseColor(owner) } : undefined}
                    disabled={disabled}
                    onClick={() => onLetter(l)}
                  >
                    {l}
                  </button>
                )
              })}
              {r === 2 && (
                <button type="button" className="key wide" onClick={onClear}>
                  {UI.clear}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
