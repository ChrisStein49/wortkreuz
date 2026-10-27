import type { Difficulty } from '../core/schedule.ts'
import type { PlayPuzzle } from '../core/codec.ts'
import type { DayResult } from '../game/dayResult.ts'
import { shareText } from '../game/share.ts'
import type { SavedProgress } from '../game/state.ts'
import { STREAK_MIN_SOLVED } from '../game/streak.ts'
import { useState } from 'react'
import { CATEGORIES } from '../lang/de/index.ts'
import { formatTime, UI } from '../lang/de/ui.ts'
import { Goose } from './Goose.tsx'

/** The orange goose (symbol 1) is the app's mark */
const BRAND_GOOSE = 1

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
  onArchive: () => void
  /** Set when showing a past day from the archive */
  archive: { onBack: () => void } | null
}

export function Overview({ date, puzzles, progress, day, streak, onOpen, onRules, intro, onArchive, archive }: Props) {
  // Suggest the first unsolved puzzle
  const suggested = progress.findIndex((p) => !p?.solved)
  const [copied, setCopied] = useState(false)
  // Sharing from here too, for players who come back after finishing the day
  const share = async () => {
    if ((await shareText(UI.shareDay(UI.shortDate(date), day))) === 'copied') setCopied(true)
  }
  return (
    <div className="screen overview">
      {archive ? (
        <>
          <header className="bar centered">
            <button type="button" className="back" onClick={archive.onBack} aria-label={UI.back}>‹</button>
            <div className="bar-title">
              {UI.date(date)}
              <small>{UI.archiveLabel} · {day.solved} / {day.total} {UI.solvedCount}</small>
            </div>
            <span className="bar-spacer" aria-hidden="true" />
          </header>
          <p className="archive-note">{UI.archiveStreakNote}</p>
        </>
      ) : (
        <>
          {/* the orange goose marks it as a ganzgraz puzzle (also the app icon) */}
          <div className="brand-row">
            <Goose symbol={BRAND_GOOSE} className="brand-goose" />
            <div>
              <h1 className="brand">{UI.appName}</h1>
              <div className="date">{UI.date(date)}</div>
            </div>
          </div>
        </>
      )}

      {intro && !archive && (
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

      {!archive && (
      <div className="pills">
        <div className={`pill${streak > 0 ? ' on' : ''}`}>
          <b>🔥 {streak}</b>
          {UI.streak(streak)}
        </div>
        <div className={`pill${day.solved >= STREAK_MIN_SOLVED ? ' on' : ''}${day.allSolved ? ' with-share' : ''}`}>
          <span>
            <b>{day.solved} / {day.total}</b>
            {day.allSolved ? UI.solvedTodayAll : UI.solvedToday(STREAK_MIN_SOLVED)}
          </span>
          {day.allSolved && (
            <button type="button" className="pill-share" onClick={share}>
              {copied ? UI.copiedShort : UI.shareShort}
            </button>
          )}
        </div>
      </div>
      )}

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
        {!archive && <button type="button" onClick={onArchive}>📅 {UI.archive}</button>}
        <button type="button" onClick={onRules}>📖 {UI.rules}</button>
      </div>
    </div>
  )
}
