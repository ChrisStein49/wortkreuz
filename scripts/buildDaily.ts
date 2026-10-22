// Builds or extends the daily calendar in src/data/daily-de.json.
//   npm run build-daily -- [days] [--start YYYY-MM-DD] [--from YYYY-MM-DD] [--out file]
// Appends `days` new days (default 365) after the last existing day; days
// already in the calendar are never changed, so the archive stays stable.
// --start only applies when the calendar doesn't exist yet (default: today).
// --from regenerates from that date on (e.g. after word list changes): days
//   before it are kept, later ones rebuilt; `days` then defaults to restoring
//   the previous length. Never use a date that players may already have played.
// --out writes somewhere else (e.g. a preview) instead of the real calendar.
//
// Rules: the weekday/weekend difficulty curve (src/core/schedule.ts), five
// different categories per day, and solution words / grid words spaced out as
// far as GAP_STEPS allows: the strictest step that can be met wins, and the
// counts per step are reported. A grid word never appears twice in one day.
// Writes a review page for the new days to scripts/out/daily.html.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fromIsoDate, toIsoDate, type Calendar } from '../src/core/calendar.ts'
import { packPuzzle, solvedLetters, unpackPuzzle } from '../src/core/codec.ts'
import { mulberry32, prepare, tryGenerate } from '../src/core/generator.ts'
import { CLASSIC_5 } from '../src/core/grid.ts'
import { dailyDifficulties, type Difficulty } from '../src/core/schedule.ts'
import type { LetterPuzzle } from '../src/core/types.ts'
import { DIFFICULTY_NAMES, generatorOptions } from './presets.ts'
import { reviewPage, summary, type ReviewSection } from './review.ts'

// [solution word gap, grid word gap] in days, strictest first
const GAP_STEPS: readonly [number, number][] = [
  [60, 3],
  [60, 2],
  [60, 1],
  [30, 1],
  [14, 1],
]
const ATTEMPTS_PER_STEP = 5_000
const REVIEW_DAYS = 14

const ROOT = join(import.meta.dirname, '..')
const CALENDAR_FILE = join(ROOT, 'src', 'data', 'daily-de.json')

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(name)
  return i >= 0 ? args.splice(i, 2)[1] : undefined
}
const startArg = flag('--start')
const fromArg = flag('--from')
const outArg = flag('--out')
const OUT_FILE = outArg ? join(process.cwd(), outArg) : CALENDAR_FILE

const calendar: Calendar = existsSync(CALENDAR_FILE)
  ? JSON.parse(readFileSync(CALENDAR_FILE, 'utf8'))
  : { start: startArg ?? toIsoDate(new Date()), days: [] }
if (startArg && calendar.days.length && startArg !== calendar.start)
  console.warn(`calendar already starts ${calendar.start}; --start ignored`)
const previousLength = calendar.days.length
if (fromArg) {
  const keep = Math.round((fromIsoDate(fromArg).getTime() - fromIsoDate(calendar.start).getTime()) / 86_400_000)
  if (keep < 0 || keep > calendar.days.length) throw new Error(`--from ${fromArg} is outside the calendar`)
  calendar.days = calendar.days.slice(0, keep)
  console.log(`keeping ${keep} days, regenerating from ${fromArg}`)
}
const newDays = Number(args[0] ?? (fromArg ? previousLength - calendar.days.length : 365))

// Last day each solution word / grid word was used
const lastSolution = new Map<string, number>()
const lastGridWord = new Map<string, number>()
const gridWords = (letters: string[]) => CLASSIC_5.slots.map((slot) => slot.map((i) => letters[i]).join(''))
calendar.days.forEach((day, i) =>
  day.forEach((packed) => {
    const p = unpackPuzzle(packed)
    lastSolution.set(p.solution.word, i)
    for (const w of gridWords(solvedLetters(p))) lastGridWord.set(w, i)
  }),
)

const prepared = Object.fromEntries(
  (['easy', 'medium', 'hard'] as const).map((d) => [d, prepare(generatorOptions(d))]),
) as Record<Difficulty, ReturnType<typeof prepare>>

const recent = (last: Map<string, number>, word: string, day: number, gap: number) =>
  last.has(word) && day - last.get(word)! < gap

function puzzleFor(day: number, slot: number, difficulty: Difficulty, usedCategories: Set<string>, id: string) {
  // Deterministic per day and slot, so a rebuild from scratch is reproducible
  const rng = mulberry32(day * 101 + slot * 7919 + 1)
  for (const [step, [solutionGap, gridGap]] of GAP_STEPS.entries()) {
    for (let a = 0; a < ATTEMPTS_PER_STEP; a++) {
      const p = tryGenerate(prepared[difficulty], rng, id)
      if (!p) continue
      if (usedCategories.has(p.solution.categoryId)) continue
      if (recent(lastSolution, p.solution.word, day, solutionGap)) continue
      if (gridWords(solvedLetters(p)).some((w) => recent(lastGridWord, w, day, gridGap))) continue
      perStep[step]++
      return p
    }
  }
  throw new Error(`no puzzle for ${id}`)
}

const perStep = GAP_STEPS.map(() => 0)
const firstNew = calendar.days.length
const review: ReviewSection[] = []
const started = Date.now()
for (let day = firstNew; day < firstNew + newDays; day++) {
  const date = fromIsoDate(calendar.start)
  date.setDate(date.getDate() + day)
  const iso = toIsoDate(date)
  const usedCategories = new Set<string>()
  const puzzles: LetterPuzzle[] = []
  dailyDifficulties(date).forEach((difficulty, slot) => {
    const p = puzzleFor(day, slot, difficulty, usedCategories, `${iso}-${slot + 1}`)
    usedCategories.add(p.solution.categoryId)
    lastSolution.set(p.solution.word, day)
    for (const w of gridWords(solvedLetters(p))) lastGridWord.set(w, day)
    puzzles.push(p)
  })
  calendar.days.push(puzzles.map(packPuzzle))
  if (day - firstNew < REVIEW_DAYS) {
    const weekday = date.toLocaleDateString('de-AT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const levels = dailyDifficulties(date)
    review.push({
      heading: weekday,
      puzzles: puzzles.map((puzzle, i) => ({ puzzle, label: `Rätsel ${i + 1} – ${DIFFICULTY_NAMES[levels[i]]}` })),
    })
    for (const p of puzzles) console.log(`${p.id} ${summary(p)}`)
  }
}

mkdirSync(join(OUT_FILE, '..'), { recursive: true })
writeFileSync(
  OUT_FILE,
  `{"start":"${calendar.start}","days":[\n${calendar.days.map((d) => JSON.stringify(d)).join(',\n')}\n]}\n`,
)
mkdirSync(join(ROOT, 'scripts', 'out'), { recursive: true })
writeFileSync(join(ROOT, 'scripts', 'out', 'daily.html'), reviewPage('Tagesrätsel', review))

const last = fromIsoDate(calendar.start)
last.setDate(last.getDate() + calendar.days.length - 1)
console.log('\npuzzles per spacing step (solution word gap / grid word gap):')
GAP_STEPS.forEach(([s, g], i) => console.log(`  ${s} / ${g} days: ${perStep[i]}`))
console.log(
  `added ${newDays} days in ${((Date.now() - started) / 1000).toFixed(1)}s; ` +
    `calendar ${calendar.start} .. ${toIsoDate(last)} (${calendar.days.length} days)`,
)
