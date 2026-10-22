import { useEffect, useReducer, useRef, useState } from 'react'
import type { PlayPuzzle } from '../core/codec.ts'
import type { Difficulty } from '../core/schedule.ts'
import type { DayResult } from '../game/dayResult.ts'
import { shareText } from '../game/share.ts'
import { saveProgress, loadProgress } from '../game/storage.ts'
import { correctWordCells, initialState, reduce, tileLetter, toSaved, type Action, type PlayState } from '../game/state.ts'
import { CATEGORIES } from '../lang/de/index.ts'
import { formatTime, UI } from '../lang/de/ui.ts'
import { Board } from './Board.tsx'
import { gooseColor } from './Goose.tsx'
import { LetterPicker } from './LetterPicker.tsx'
import { SolutionArea } from './SolutionArea.tsx'

const CATEGORY = new Map(CATEGORIES.map((c) => [c.id, c]))

interface Props {
  puzzle: PlayPuzzle
  date: Date
  iso: string
  index: number
  total: number
  difficulty: Difficulty
  day: DayResult
  /** Today (YYYY-MM-DD): recorded as the day a puzzle got solved */
  todayIso: string
  /** Replaying a past day: no sharing (only today's result is shared) */
  archive: boolean
  onBack: () => void
  /** Next unsolved puzzle of the day, or null when the day is complete */
  next: { index: number; open: () => void } | null
  onProgress: () => void
}

export function PlayScreen(props: Props) {
  const { puzzle, iso, index } = props
  const [state, dispatch] = useReducer(
    (s: PlayState, a: Action) => reduce(puzzle, s, a),
    null,
    () => initialState(puzzle, loadProgress(iso, index)),
  )

  // Save after every change (ticks included, so the clock survives a reload),
  // with the day it got solved on: archive replays don't count for the streak
  const wasSolved = useRef(state.solved)
  const solvedOn = useRef(loadProgress(iso, index)?.solvedOn)
  useEffect(() => {
    if (state.solved && !solvedOn.current) solvedOn.current = props.todayIso
    saveProgress(iso, index, { ...toSaved(state), ...(solvedOn.current && { solvedOn: solvedOn.current }) })
    if (state.solved !== wasSolved.current) {
      wasSolved.current = state.solved
      props.onProgress()
    }
  }, [state, iso, index]) // eslint-disable-line react-hooks/exhaustive-deps

  useTimer(state.solved, (ms) => dispatch({ type: 'tick', ms }))
  // The glow plays only at the moment of solving, not when reopening later
  const solvedAtStart = useRef(state.solved)

  const category = CATEGORY.get(puzzle.solution.categoryId)
  return (
    <div
      className="screen play"
      onClick={(e) => {
        // a tap on empty space closes the letter picker
        if (state.selected !== null && !(e.target as Element).closest('button, .sheet')) dispatch({ type: 'closePicker' })
      }}
    >
      <header className="bar">
        <button type="button" className="back" onClick={props.onBack} aria-label={UI.back}>‹</button>
        <div className="bar-title">
          {UI.puzzleOf(index + 1, props.total)}
          <small>
            {UI.difficulty[props.difficulty]}
            {props.archive && ` · ${UI.archiveLabel} ${UI.shortDate(props.date)}`}
          </small>
        </div>
        {!state.solved && <div className="timer">{formatTime(state.elapsedMs)}</div>}
      </header>

      {state.solved ? (
        <Solved {...props} state={state} categoryName={category?.name ?? ''} justSolved={!solvedAtStart.current} />
      ) : (
        <>
          <Board
            puzzle={puzzle}
            state={state}
            onSelect={(symbol) => dispatch({ type: 'select', symbol })}
            okCells={correctWordCells(puzzle, state)}
          />
          <SolutionArea
            puzzle={puzzle}
            state={state}
            clue={category?.clue ?? ''}
            onTile={(tile) => dispatch({ type: 'tapTile', tile })}
            onSlot={(slot) => dispatch({ type: 'tapSlot', slot })}
          />
          {state.wrongOrder && <p className="feedback">{UI.notYet}</p>}
          <LetterPicker
            puzzle={puzzle}
            state={state}
            onLetter={(letter) => dispatch({ type: 'assign', letter })}
            onClear={() => dispatch({ type: 'clear' })}
            onHint={() => dispatch({ type: 'hint' })}
            onClose={() => dispatch({ type: 'closePicker' })}
          />
        </>
      )}
    </div>
  )
}

/** Calls `tick` with elapsed ms while the page is visible and not paused */
function useTimer(paused: boolean, tick: (ms: number) => void) {
  const tickRef = useRef(tick)
  tickRef.current = tick
  useEffect(() => {
    if (paused) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      if (document.visibilityState === 'visible') tickRef.current(Math.min(now - last, 2000))
      last = now
    }, 250)
    return () => clearInterval(id)
  }, [paused])
}

// Same layout as while playing (grid on top, solution word below) so the
// player keeps their bearings and can look over the finished puzzle.
function Solved(props: Props & { state: PlayState; categoryName: string; justSolved: boolean }) {
  const { puzzle, state, categoryName, date, day, next, onBack, archive, justSolved } = props
  const [copied, setCopied] = useState(false)
  const time = formatTime(state.elapsedMs)
  const share = async () => {
    // one share per day, with the totals of all puzzles
    if ((await shareText(UI.shareDay(UI.shortDate(date), day))) === 'copied') setCopied(true)
  }
  return (
    <div className={`solved${justSolved ? ' celebrate' : ''}`}>
      <div className="solved-board">
        <Board puzzle={puzzle} state={state} onSelect={() => {}} />
      </div>
      <div className="solved-word" aria-label={puzzle.solution.word}>
        {state.slots.map((tile, i) => {
          const t = puzzle.solution.tiles[tile!]
          return (
            <span key={i} className="solved-letter" style={{ animationDelay: `${300 + i * 90}ms` }}>
              <span style={{ color: 'symbol' in t ? gooseColor(t.symbol) : undefined }}>{tileLetter(puzzle, state, tile!)}</span>
            </span>
          )
        })}
      </div>
      <div className="solved-title">
        ✓ {UI.solved} <span className="solved-cat">· {categoryName}</span>
      </div>
      <div className="result-line">
        <span title={UI.time}>⏱ {time}</span>
        <span>💡 {state.hintsUsed} {UI.hints(state.hintsUsed)}</span>
        <span>{day.solved} / {day.total} {UI.today}</span>
      </div>
      {archive ? null : day.allSolved ? (
        <button type="button" className="btn primary" onClick={share}>{copied ? UI.copied : UI.share}</button>
      ) : (
        <p className="share-later">{UI.shareLater(day.total)}</p>
      )}
      {next ? (
        <button type="button" className="btn primary" onClick={next.open}>{UI.next(next.index + 1)}</button>
      ) : (
        <button type="button" className={archive ? 'btn primary' : 'btn secondary'} onClick={onBack}>{UI.toOverview}</button>
      )}
    </div>
  )
}
