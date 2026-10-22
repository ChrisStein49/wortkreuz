// Verifies the shipped calendar independently of the generator: every puzzle
// unpacks, has exactly one solution, follows the rules, and the day plan and
// spacing hold. Prints statistics.
//   npx tsx scripts/checkDaily.ts
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import words5 from '../data/de/words5.json' with { type: 'json' }
import { fromIsoDate, type Calendar } from '../src/core/calendar.ts'
import { solvedLetters, unpackPuzzle } from '../src/core/codec.ts'
import { CLASSIC_5 } from '../src/core/grid.ts'
import { dailyDifficulties } from '../src/core/schedule.ts'
import { countSolutions, type Pattern } from '../src/core/solver.ts'
import { CATEGORIES } from '../src/lang/de/index.ts'

// optional argument: another calendar file (e.g. a preview)
const calendarPath = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(import.meta.dirname, '..', 'src', 'data', 'daily-de.json')
const calendar: Calendar = JSON.parse(readFileSync(calendarPath, 'utf8'))
const VALID = words5.map((w) => w.word)
const gridOk = new Set(words5.filter((w) => w.grid).map((w) => w.word))
const categoryWords = new Map(CATEGORIES.map((c) => [c.id, new Set(c.words)]))

const errors: string[] = []
const lastSolution = new Map<string, number>()
let minSolutionGap = Infinity
const solutionUses = new Map<string, number>()
const categoryUses = new Map<string, number>()
let plainPuzzles = 0
const givenByDifficulty: Record<string, number[]> = { easy: [], medium: [], hard: [] }

calendar.days.forEach((day, d) => {
  const date = fromIsoDate(calendar.start)
  date.setDate(date.getDate() + d)
  const levels = dailyDifficulties(date)
  const where = (i: number) => `day ${d} puzzle ${i + 1}`
  if (day.length !== levels.length) errors.push(`day ${d}: ${day.length} puzzles`)
  const cats = new Set<string>()
  const dayWords = new Set<string>()
  day.forEach((packed, i) => {
    const p = unpackPuzzle(packed)
    const letters = solvedLetters(p)
    const words = CLASSIC_5.slots.map((slot) => slot.map((c) => letters[c]).join(''))
    for (const w of words) {
      if (!gridOk.has(w)) errors.push(`${where(i)}: ${w} is not a grid word`)
      if (dayWords.has(w)) errors.push(`${where(i)}: ${w} twice in one day`)
      dayWords.add(w)
    }
    const symbols = p.key.length
    const given = p.cells.filter((c) => c.kind === 'given')
    if (symbols > 6) errors.push(`${where(i)}: ${symbols} symbols`)
    if (given.length > 14) errors.push(`${where(i)}: ${given.length} printed cells`)
    if (new Set(p.key).size !== symbols) errors.push(`${where(i)}: two symbols share a letter`)
    if (p.key.some((l) => given.some((c) => c.kind === 'given' && c.letter === l)))
      errors.push(`${where(i)}: symbol letter also printed`)
    // solution tiles must spell the word in some order
    const tileLetters = p.solution.tiles.map((t) => ('symbol' in t ? p.key[t.symbol] : t.letter))
    if ([...tileLetters].sort().join('') !== [...p.solution.word].sort().join(''))
      errors.push(`${where(i)}: tiles don't spell ${p.solution.word}`)
    if (!categoryWords.get(p.solution.categoryId)?.has(p.solution.word))
      errors.push(`${where(i)}: ${p.solution.word} not in ${p.solution.categoryId}`)
    if (cats.has(p.solution.categoryId)) errors.push(`${where(i)}: category repeated`)
    cats.add(p.solution.categoryId)
    const pattern: Pattern = {
      template: CLASSIC_5,
      symbolCount: symbols,
      cells: p.cells.map((c) => (c.kind === 'blocked' ? null : c.kind === 'given' ? c.letter : c.symbol)),
    }
    const n = countSolutions(pattern, VALID, 2)
    if (n !== 1) errors.push(`${where(i)}: ${n} solutions`)

    const prev = lastSolution.get(p.solution.word)
    if (prev !== undefined) minSolutionGap = Math.min(minSolutionGap, d - prev)
    lastSolution.set(p.solution.word, d)
    solutionUses.set(p.solution.word, (solutionUses.get(p.solution.word) ?? 0) + 1)
    categoryUses.set(p.solution.categoryId, (categoryUses.get(p.solution.categoryId) ?? 0) + 1)
    if (p.solution.tiles.some((t) => 'letter' in t)) plainPuzzles++
    givenByDifficulty[levels[i]].push(given.length)
  })
})

const total = calendar.days.reduce((n, d) => n + d.length, 0)
const avg = (xs: number[]) => (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(1)
console.log(`${calendar.days.length} days, ${total} puzzles from ${calendar.start}`)
console.log(`distinct solution words ${solutionUses.size}, max uses of one word ${Math.max(...solutionUses.values())}`)
console.log(`smallest gap between repeats of a solution word: ${minSolutionGap} days`)
console.log(`puzzles with plain solution letters: ${((plainPuzzles / total) * 100).toFixed(0)}%`)
console.log(
  `printed cells avg: ${Object.entries(givenByDifficulty).map(([k, v]) => `${k} ${avg(v)}`).join(', ')}`,
)
console.log(
  `categories: ${[...categoryUses].sort((a, b) => b[1] - a[1]).map(([c, n]) => `${c} ${n}`).join(', ')}`,
)
if (errors.length) {
  console.error(`\n${errors.length} problems:\n${errors.slice(0, 30).join('\n')}`)
  process.exit(1)
}
console.log('\nall checks passed')
