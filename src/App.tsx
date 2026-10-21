import { useMemo, useState } from 'react'
import { puzzlesFor, toIsoDate, type Calendar } from './core/calendar.ts'
import { dailyDifficulties, PUZZLES_PER_DAY } from './core/schedule.ts'
import daily from './data/daily-de.json'
import { dayResult } from './game/dayResult.ts'
import { introDone, loadProgress, markIntroDone, solvedCount } from './game/storage.ts'
import { currentStreak } from './game/streak.ts'
import { UI } from './lang/de/ui.ts'
import { Overview } from './components/Overview.tsx'
import { PlayScreen } from './components/PlayScreen.tsx'
import { Rules } from './components/Rules.tsx'

const calendar = daily as Calendar

type Screen = { name: 'overview' } | { name: 'play'; index: number } | { name: 'rules' }

export default function App() {
  // Fixed for the session; a new day starts on the next app launch
  const [today] = useState(() => new Date())
  const iso = toIsoDate(today)
  const puzzles = useMemo(() => puzzlesFor(calendar, today), [today])
  const levels = dailyDifficulties(today)
  // Always start on the overview; first-time players get a card there
  // suggesting the instructions (many know the puzzle from the newsletter)
  const [screen, setScreen] = useState<Screen>({ name: 'overview' })
  const [showIntro, setShowIntro] = useState(() => !introDone())
  const finishIntro = () => {
    markIntroDone()
    setShowIntro(false)
  }
  const [version, setVersion] = useState(0) // bumps when a puzzle gets solved

  const progress = useMemo(
    () => (puzzles ?? []).map((_, i) => loadProgress(iso, i)),
    [puzzles, iso, version, screen], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const day = dayResult(levels, progress)
  const streak = useMemo(
    () => currentStreak(today, (d) => solvedCount(d, PUZZLES_PER_DAY), calendar.start),
    [today, version], // eslint-disable-line react-hooks/exhaustive-deps
  )

  if (screen.name === 'rules') {
    return (
      <Rules
        onClose={() => setScreen({ name: 'overview' })}
      />
    )
  }

  if (!puzzles) return <div className="screen"><p className="no-puzzles">{UI.noPuzzles}</p></div>

  if (screen.name === 'play') {
    const open = screen.index
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
        onBack={() => setScreen({ name: 'overview' })}
        next={nextIndex === undefined ? null : { index: nextIndex, open: () => setScreen({ name: 'play', index: nextIndex }) }}
        onProgress={() => {
          setVersion((v) => v + 1)
          finishIntro() // solving a puzzle shows they know how it works
        }}
      />
    )
  }

  return (
    <Overview
      date={today}
      puzzles={puzzles}
      progress={progress}
      day={day}
      streak={streak}
      onOpen={(index) => setScreen({ name: 'play', index })}
      onRules={() => setScreen({ name: 'rules' })}
      intro={
        showIntro
          ? {
              onShow: () => {
                finishIntro()
                setScreen({ name: 'rules' })
              },
              onSkip: finishIntro,
            }
          : null
      }
    />
  )
}
