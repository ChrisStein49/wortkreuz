// German interface text. Another language gets its own file with the same keys.
import type { Difficulty } from '../../core/schedule.ts'
import type { DayResult } from '../../game/dayResult.ts'

const SHARE_SQUARE: Record<Difficulty, string> = { easy: '🟩', medium: '🟨', hard: '🟥' }

export const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const UI = {
  appName: 'Wortkreuz',
  difficulty: { easy: 'leicht', medium: 'mittel', hard: 'schwer' } satisfies Record<Difficulty, string>,
  puzzleOf: (n: number, total: number) => `Rätsel ${n} von ${total}`,
  puzzle: (n: number) => `Rätsel ${n}`,
  back: 'Zurück',
  whichLetter: 'Welcher Buchstabe?',
  clear: 'zurücksetzen',
  hint: (left: number) => (left > 0 ? `Tipp · noch ${left}` : 'keine Tipps mehr'),
  hintTitle: 'Streicht einen Buchstaben, der nicht vorkommt',
  notYet: 'Noch nicht ganz – irgendetwas fehlt noch.',
  solved: 'Gelöst!',
  time: 'Zeit',
  hints: (n: number) => (n === 1 ? 'Tipp' : 'Tipps'),
  today: 'heute',
  next: (n: number) => `Weiter zu Rätsel ${n}`,
  toOverview: 'Zur Übersicht',
  share: 'Tagesergebnis teilen',
  shareLater: (total: number) => `Sind alle ${total} gelöst, kannst du dein Tagesergebnis teilen.`,
  copied: 'In die Zwischenablage kopiert',
  /** One share per day: a square per puzzle (difficulty), totals of time and hints */
  shareDay: (date: string, r: DayResult) =>
    [
      `Wortkreuz ${date}`,
      `${r.levels.map((l) => SHARE_SQUARE[l]).join('')} ${r.solved}/${r.total}`,
      `⏱ ${formatTime(r.totalMs)} · 💡 ${r.hints} ${r.hints === 1 ? 'Tipp' : 'Tipps'}`,
    ].join('\n'),
  noPuzzles: 'Für heute gibt es (noch) keine Rätsel.',
  started: 'gestartet',
  streak: (n: number) => (n === 1 ? 'Tag in Folge' : 'Tage in Folge'),
  solvedToday: (min: number) => `heute gelöst · ab ${min} zählt der Tag`,
  rules: 'Spielregeln',
  rulesTitle: 'So wird gespielt',
  rulesClose: 'Los geht’s',
  rulesGoal: 'Finde die fehlenden Buchstaben und das Lösungswort!',
  rulesText: [
    'Jede Gans steht für einen Buchstaben: gleiche Farbe = gleicher Buchstabe, verschiedene Farben = verschiedene Buchstaben.',
    'Eine Gans steht nie für einen Buchstaben, der schon im Gitter gedruckt ist.',
    'Die drei Zeilen und drei Spalten enthalten Wörter (nur Grundformen, ohne Umlaute und spezielle Buchstaben wie ß.)',
    'Tippe eine Gans an und wähle einen Buchstaben. 💡 Ein Tipp streicht einen Buchstaben, der nicht vorkommt – drei Tipps stehen pro Rätsel zur Verfügung.',
    'Die Gänse unter der Frage ergeben, richtig angeordnet, das Lösungswort. Tippe einen Buchstaben an, um ihn auf die erste freie Position zu legen. Tippe zwei gelegte Buchstaben nacheinander an um sie zu tauschen.',
    'Gelöst ist ein Rätsel, wenn alle Gänse stimmen und das Lösungswort korrekt ist.',
    'Jeden Tag gibt es 5 neue Rätsel. Ab 3 gelösten zählt der Tag für deine Serie; sind alle 5 gelöst, kannst du dein Tagesergebnis teilen.',
  ],
  date: (d: Date) => d.toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
  shortDate: (d: Date) => d.toLocaleDateString('de-AT', { day: 'numeric', month: 'numeric' }),
}
