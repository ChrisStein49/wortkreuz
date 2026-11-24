import { useEffect, useMemo, useState } from 'react'
import { dayIndex, fromIsoDate, puzzlesFor, toIsoDate, type Calendar } from './core/calendar.ts'
import { parsePuzzleLink } from './core/puzzleLink.ts'
import { dailyDifficulties, PUZZLES_PER_DAY } from './core/schedule.ts'
import daily from './data/daily-de.json'
import { dayResult } from './game/dayResult.ts'
import { introDone, loadDay, markIntroDone } from './game/storage.ts'
import { currentStreak, solvedOnTime } from './game/streak.ts'
import { UI } from './lang/de/ui.ts'
import { Archive, type ArchiveDay } from './components/Archive.tsx'
import { Overview } from './components/Overview.tsx'
import { PlayScreen } from './components/PlayScreen.tsx'
import { Rules } from './components/Rules.tsx'

const calendar = daily as Calendar

/** How many past days the archive lists */
const ARCHIVE_DAYS = 14

type Screen =
  | { name: 'overview' }
  | { name: 'archive' }
  | { name: 'play'; index: number }
  | { name: 'rules'; back: 'overview' | 'archive' | { play: number } }

export default function App() {
  // Fixed for the session; a new day starts on the next app launch
  const [today] = useState(() => new Date())
  const todayIso = toIsoDate(today)
  // A direct link (e.g. from the newsletter: #2026-11-24/2) opens that puzzle
  const [link] = useState(() => parsePuzzleLink(location.hash, todayIso, calendar.start, PUZZLES_PER_DAY))
  // The day being shown: today, or a past day opened from the archive or a link
  const [viewIso, setViewIso] = useState(link?.iso ?? todayIso)
  const isArchive = viewIso !== todayIso
  const viewDate = useMemo(() => fromIsoDate(viewIso), [viewIso])

  // Always start on the overview; first-time players get a card there
  // suggesting the instructions (many know the puzzle from the newsletter)
  const [screen, setScreen] = useState<Screen>(link ? { name: 'play', index: link.index } : { name: 'overview' })

  // Remove the link from the address bar once followed (a reload then shows
  // the app as usual), and follow links opened while the app is running
  useEffect(() => {
    const clear = () => location.hash && history.replaceState(null, '', location.pathname + location.search)
    clear()
    const onHash = () => {
      const l = parsePuzzleLink(location.hash, todayIso, calendar.start, PUZZLES_PER_DAY)
      if (l) {
        setViewIso(l.iso)
        setScreen({ name: 'play', index: l.index })
      }
      clear()
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [todayIso])
  const [showIntro, setShowIntro] = useState(() => !introDone())
  const finishIntro = () => {
    markIntroDone()
    setShowIntro(false)
  }
  const [version, setVersion] = useState(0) // bumps when a puzzle gets solved

  const puzzles = useMemo(() => puzzlesFor(calendar, viewDate), [viewDate])
  const levels = dailyDifficulties(viewDate)
  const progress = useMemo(
    () => loadDay(viewIso, puzzles?.length ?? 0),
    [puzzles, viewIso, version, screen], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const day = dayResult(levels, progress)
  const streak = useMemo(
    () => currentStreak(today, (d) => solvedOnTime(d, loadDay(d, PUZZLES_PER_DAY)), calendar.start),
    [today, version], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const archiveDays = useMemo((): ArchiveDay[] => {
    const days: ArchiveDay[] = []
    for (let back = 1; back <= ARCHIVE_DAYS; back++) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - back)
      if (dayIndex(calendar.start, date) < 0) break // before the calendar starts
      const iso = toIsoDate(date)
      const solved = loadDay(iso, PUZZLES_PER_DAY).filter((p) => p?.solved).length
      days.push({ date, iso, solved, total: PUZZLES_PER_DAY })
    }
    return days
  }, [today, version, screen]) // eslint-disable-line react-hooks/exhaustive-deps

  const backToToday = () => {
    setViewIso(todayIso)
    setScreen({ name: 'overview' })
  }

  if (screen.name === 'rules') {
    const back = screen.back
    return (
      <Rules
        onClose={() =>
          setScreen(back === 'archive' ? { name: 'archive' } : back === 'overview' ? { name: 'overview' } : { name: 'play', index: back.play })
        }
      />
    )
  }

  if (screen.name === 'archive') {
    return (
      <Archive
        days={archiveDays}
        onBack={backToToday}
        onRules={() => setScreen({ name: 'rules', back: 'archive' })}
        onOpen={(iso) => {
          setViewIso(iso)
          setScreen({ name: 'overview' })
        }}
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
        key={`${viewIso}-${open}`}
        puzzle={puzzles[open]}
        date={viewDate}
        iso={viewIso}
        index={open}
        total={puzzles.length}
        difficulty={levels[open]}
        day={day}
        todayIso={todayIso}
        archive={isArchive}
        onBack={() => setScreen({ name: 'overview' })}
        onRules={() => setScreen({ name: 'rules', back: { play: open } })}
        onArchive={() => setScreen({ name: 'archive' })}
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
      date={viewDate}
      puzzles={puzzles}
      progress={progress}
      day={day}
      streak={streak}
      onOpen={(index) => setScreen({ name: 'play', index })}
      onRules={() => setScreen({ name: 'rules', back: 'overview' })}
      onArchive={() => setScreen({ name: 'archive' })}
      archive={isArchive ? { onBack: () => setScreen({ name: 'archive' }) } : null}
      intro={
        showIntro && !isArchive
          ? {
              onShow: () => {
                finishIntro()
                setScreen({ name: 'rules', back: 'overview' })
              },
              onSkip: finishIntro,
            }
          : null
      }
    />
  )
}
