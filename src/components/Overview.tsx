import type { Difficulty } from '../core/schedule.ts'
import type { PlayPuzzle } from '../core/codec.ts'
import type { DayResult } from '../game/dayResult.ts'
import type { SavedProgress } from '../game/state.ts'
import { STREAK_MIN_SOLVED } from '../game/streak.ts'
import { CATEGORIES } from '../lang/de/index.ts'
import { formatTime, UI } from '../lang/de/ui.ts'

const CATEGORY_NAME = new Map(CATEGORIES.map((c) => [c.id, c.name]))
const DOTS: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }

interface Props {
  date: Date
  puzzles: PlayPuzzle[]
  progress: (SavedProgress | null)[]
  day: DayResult
  streak: number
  onOpen: (index: number) => void
  onRules: () => void
  /** First-visit card suggesting the instructions, or null */
  intro: { onShow: () => void; onSkip: () => void } | null
}

export function Overview({ date, puzzles, progress, day, streak, onOpen, onRules, intro }: Props) {
  // Suggest the first unsolved puzzle
  const suggested = progress.findIndex((p) => !p?.solved)
  return (
    <div className="screen overview">
      <h1 className="brand">{UI.appName}</h1>
      <div className="date">{UI.date(date)}</div>

      {intro && (
        <div className="intro-card">
          <p>
            <b>{UI.introTitle}</b> {UI.introText}
          </p>
          <div className="intro-actions">
            <button type="button" className="btn primary" onClick={intro.onShow}>{UI.introShow}</button>
            <button type="button" className="btn secondary" onClick={intro.onSkip}>{UI.introSkip}</button>
          </div>
        </div>
      )}

      <div className="pills">
        <div className={`pill${streak > 0 ? ' on' : ''}`}>
          <b>🔥 {streak}</b>
          {UI.streak(streak)}
        </div>
        <div className={`pill${day.solved >= STREAK_MIN_SOLVED ? ' on' : ''}`}>
          <b>{day.solved} / {day.total}</b>
          {UI.solvedToday(STREAK_MIN_SOLVED)}
        </div>
      </div>

      {puzzles.map((puzzle, i) => {
        const p = progress[i]
        const level = day.levels[i]
        const detail = p?.solved ? CATEGORY_NAME.get(puzzle.solution.categoryId) : p && p.elapsedMs > 0 ? UI.started : ''
        return (
          <button
            key={i}
            type="button"
            className={`card${p?.solved ? ' done' : ''}${i === suggested ? ' active' : ''}`}
            onClick={() => onOpen(i)}
          >
            <span className="card-n">{p?.solved ? '✓' : i + 1}</span>
            <span className="card-info">
              {UI.puzzle(i + 1)}
              <span className="dots" title={UI.difficulty[level]} aria-label={UI.difficulty[level]}>
                {[1, 2, 3].map((d) => <i key={d} className={d <= DOTS[level] ? 'on' : ''} />)}
              </span>
              <small>{detail || ' '}</small>
            </span>
            <span className="card-right">
              {p && p.elapsedMs > 0 && formatTime(p.elapsedMs)}
              {p?.solved && p.hintsUsed > 0 && <small>{p.hintsUsed} {UI.hints(p.hintsUsed)}</small>}
            </span>
          </button>
        )
      })}

      <div className="links">
        <button type="button" onClick={onRules}>❔ {UI.rules}</button>
      </div>
    </div>
  )
}
