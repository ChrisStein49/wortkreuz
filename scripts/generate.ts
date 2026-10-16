// Generates a batch of letter puzzles for review.
//   npm run generate -- [leicht|mittel|schwer] [count] [seed]
// Writes scripts/out/<name>.json and scripts/out/<name>.html.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generate, prepare } from '../src/core/generator.ts'
import type { Difficulty } from '../src/core/schedule.ts'
import type { LetterPuzzle } from '../src/core/types.ts'
import { DIFFICULTY_NAMES, generatorOptions } from './presets.ts'
import { reviewPage, summary } from './review.ts'

const [name = 'mittel', countArg = '12', seedArg = '1'] = process.argv.slice(2)
const difficulty = (Object.keys(DIFFICULTY_NAMES) as Difficulty[]).find((d) => DIFFICULTY_NAMES[d] === name)
if (!difficulty) throw new Error(`unknown preset ${name}`)

const prepared = prepare(generatorOptions(difficulty))
const puzzles: LetterPuzzle[] = []
const started = Date.now()
for (let i = 0; puzzles.length < Number(countArg); i++) {
  const p = generate(prepared, Number(seedArg) * 100_000 + i, `de-${name}-${seedArg}-${i}`)
  if (p) puzzles.push(p)
}
console.log(`${puzzles.length} puzzles in ${((Date.now() - started) / 1000).toFixed(1)}s`)

const OUT = join(import.meta.dirname, 'out')
mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, `${name}.json`), JSON.stringify(puzzles, null, 1))
writeFileSync(join(OUT, `${name}.html`), reviewPage(`Prüfstapel „${name}“`, [{ puzzles: puzzles.map((puzzle) => ({ puzzle })) }]))
console.log(`wrote scripts/out/${name}.json and .html`)
for (const p of puzzles) console.log(`${p.id.padEnd(18)} ${summary(p)}`)
