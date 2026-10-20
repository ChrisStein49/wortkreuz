import { useMemo, useState } from 'react'
import { puzzlesFor, toIsoDate, type Calendar } from './core/calendar.ts'
import { dailyDifficulties } from './core/schedule.ts'
import daily from './data/daily-de.json'
import { dayResult } from './game/dayResult.ts'
import { loadProgress } from './game/storage.ts'
import { formatTime, UI } from './lang/de/ui.ts'
import { PlayScreen } from './components/PlayScreen.tsx'

const calendar = daily as Calendar

export default function App() {
  // Fixed for the session; a new day starts on the next app launch
  const [today] = useState(() => new Date())
  const iso = toIsoDate(today)
  const puzzles = useMemo(() => puzzlesFor(calendar, today), [today])
  const levels = dailyDifficulties(today)
  const [open, setOpen] = useState<number | null>(null)
  const [version, setVersion] = useState(0) // bumps when a puzzle gets solved

  const progress = useMemo(
    () => (puzzles ?? []).map((_, i) => loadProgress(iso, i)),
    [puzzles, iso, version, open], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const day = dayResult(levels, progress)

  if (!puzzles) return <div className="screen"><p className="no-puzzles">{UI.noPuzzles}</p></div>

  if (open !== null) {
    // next unsolved puzzle after this one, wrapping around
    const nextIndex = Array.from({ length: puzzles.length - 1 }, (_, k) => (open + k + 1) % puzzles.length).find(
      (i) => !progress[i]?.solved,
    )
    return (
      <PlayScreen
        key={open}
        puzzle={puzzles[open]}
        date={today}
        iso={iso}
        index={open}
        total={puzzles.length}
        difficulty={levels[open]}
        day={day}
        onBack={() => setOpen(null)}
        next={nextIndex === undefined ? null : { index: nextIndex, open: () => setOpen(nextIndex) }}
        onProgress={() => setVersion((v) => v + 1)}
      />
    )
  }

  // Interim day list until the real overview (next step) replaces it
  return (
    <div className="screen overview">
      <h1 className="brand">{UI.appName}</h1>
      <div className="date">{UI.date(today)}</div>
      <p className="placeholder-note">{UI.overviewPlaceholder}</p>
      {puzzles.map((_, i) => {
        const p = progress[i]
        return (
          <button key={i} type="button" className={`card${p?.solved ? ' done' : ''}`} onClick={() => setOpen(i)}>
            <span className="card-n">{p?.solved ? '✓' : i + 1}</span>
            <span className="card-info">
              {UI.puzzle(i + 1)} <small>{UI.difficulty[levels[i]]}</small>
            </span>
            <span className="card-right">
              {p?.solved ? formatTime(p.elapsedMs) : p && p.elapsedMs > 0 ? UI.started : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}
