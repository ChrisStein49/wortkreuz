// Generates a batch of letter puzzles for review.
//   npm run generate -- [preset] [count] [seed]
// preset: leicht | mittel | schwer (default mittel)
// Writes scripts/out/<preset>.json and scripts/out/<preset>.html.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import words5 from '../data/de/words5.json' with { type: 'json' }
import { generate, prepare, type GeneratorOptions } from '../src/core/generator.ts'
import { CLASSIC_5 } from '../src/core/grid.ts'
import type { LetterPuzzle } from '../src/core/types.ts'
import { ALPHABET, CATEGORIES, LANG } from '../src/lang/de/index.ts'

type Preset = Pick<GeneratorOptions, 'maxWordRank' | 'symbols' | 'minGivenCells' | 'requireForced' | 'solutionLength'>

// At most 6 symbols so the colours stay easy to tell apart. "leicht" aims at
// the printed newsletter: readers can't try letters out, so it must be
// fillable word by word.
const PRESETS: Record<string, Preset> = {
  leicht: { maxWordRank: 400, symbols: { min: 4, max: 5 }, minGivenCells: 10, requireForced: true, solutionLength: { min: 4, max: 6 } },
  mittel: { maxWordRank: 650, symbols: { min: 5, max: 6 }, minGivenCells: 8, requireForced: true, solutionLength: { min: 5, max: 6 } },
  schwer: { maxWordRank: 900, symbols: { min: 6, max: 6 }, minGivenCells: 6, requireForced: false, solutionLength: { min: 5, max: 7 } },
}

const [presetName = 'mittel', countArg = '12', seedArg = '1'] = process.argv.slice(2)
const preset = PRESETS[presetName]
if (!preset) throw new Error(`unknown preset ${presetName}`)

const prepared = prepare({
  lang: LANG,
  alphabet: ALPHABET,
  template: CLASSIC_5,
  words: words5,
  categories: CATEGORIES,
  ...preset,
})

const puzzles: LetterPuzzle[] = []
const started = Date.now()
for (let i = 0; puzzles.length < Number(countArg); i++) {
  const p = generate(prepared, Number(seedArg) * 100_000 + i, `${LANG}-${presetName}-${seedArg}-${i}`)
  if (p) puzzles.push(p)
}
console.log(`${puzzles.length} puzzles in ${((Date.now() - started) / 1000).toFixed(1)}s`)

const OUT = join(import.meta.dirname, 'out')
mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, `${presetName}.json`), JSON.stringify(puzzles, null, 1))
writeFileSync(join(OUT, `${presetName}.html`), reviewPage(presetName, puzzles))
console.log(`wrote scripts/out/${presetName}.json and .html`)

for (const p of puzzles) {
  const d = p.stats.deduction
  const words = [0, 2, 4].map((r) => rowWord(p, r)).join(' ')
  console.log(
    `${p.id.padEnd(18)} ${words}  -> ${p.solution.word.padEnd(9)} sym ${p.stats.symbols} given ${p.stats.givenCells} cells/${p.stats.givenLetters} letters ` +
      `rank ${p.stats.meanWordRank}/${p.stats.maxWordRank}  word-by-word ${d.forced ? 'Y' : `${d.forcedWords}/6`} open ${d.openingChoices}`,
  )
}

function letterAt(p: LetterPuzzle, i: number) {
  const c = p.cells[i]
  return c.kind === 'given' ? c.letter : c.kind === 'symbol' ? p.key[c.symbol] : ''
}
function rowWord(p: LetterPuzzle, r: number) {
  return Array.from({ length: p.size }, (_, c) => letterAt(p, r * p.size + c)).join('')
}

// Review page: puzzle as the player sees it, solution revealed on click
function reviewPage(title: string, puzzles: LetterPuzzle[]) {
  // Six clearly distinct colours: red, orange, green, blue, pink, black
  const COLORS = ['#d62828', '#f28c00', '#2e9e44', '#1f5fd1', '#e85aa8', '#222222']
  const disc = (s: number) => `<span class="disc" style="background:${COLORS[s]}"></span>`
  const card = (p: LetterPuzzle) => {
    const cells = p.cells
      .map((c, i) => {
        if (c.kind === 'blocked') return '<div class="cell blocked"></div>'
        if (c.kind === 'given') return `<div class="cell">${c.letter}</div>`
        return `<div class="cell sym">${disc(c.symbol)}<b style="color:${COLORS[c.symbol]}">${letterAt(p, i)}</b></div>`
      })
      .join('')
    const d = p.stats.deduction
    return `<section class="card">
  <div class="grid">${cells}</div>
  <div class="side">
    <p class="clue">${p.solution.clue}</p>
    <div class="hint">${p.solution.symbols.map(disc).join('')}</div>
    <p class="answer">${p.solution.word}</p>
    <table>
      <tr><td>Symbole</td><td>${p.stats.symbols}</td></tr>
      <tr><td>Vorgegebene Felder (verschiedene Buchstaben)</td><td>${p.stats.givenCells} (${p.stats.givenLetters})</td></tr>
      <tr><td>Wort-Rang Ø / max</td><td>${p.stats.meanWordRank} / ${p.stats.maxWordRank}</td></tr>
      <tr><td>Wort für Wort lösbar</td><td>${d.forced ? '✓' : `✗ – nach ${d.forcedWords} von 6 Wörtern muss man probieren`}</td></tr>
      <tr><td>Passende Wörter am engsten Einstieg</td><td>${d.openingChoices}</td></tr>
    </table>
    <p class="id">${p.id}</p>
  </div>
</section>`
  }
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wortkreuz – ${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
  body { font-family: Inter, sans-serif; background: #eee; margin: 0; padding: 16px; color: #222; }
  h1 { font-size: 20px; } .note { color: #555; max-width: 60em; }
  .card { display: flex; flex-wrap: wrap; gap: 24px; background: #fff; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .grid { display: grid; grid-template-columns: repeat(5, 56px); border: 3px solid #111; width: max-content; }
  .cell { width: 56px; height: 56px; box-sizing: border-box; border: 1px solid #999; display: flex; align-items: center;
          justify-content: center; font: 600 30px 'Noto Serif', serif; position: relative; background: #f7f7f7; }
  .blocked { background: #3a302e; }
  .disc { display: inline-block; width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #555; box-sizing: border-box; }
  .cell b { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; background: #f7f7f7; }
  .card.show .cell b { display: flex; }
  .hint { display: flex; gap: 6px; flex-wrap: wrap; } .hint .disc { width: 30px; height: 30px; }
  .answer { display: none; font: 600 28px 'Noto Serif', serif; letter-spacing: 2px; }
  .card.show .answer { display: block; }
  .clue { font-size: 17px; margin-top: 0; }
  table { font-size: 13px; color: #444; border-collapse: collapse; } td { padding: 2px 10px 2px 0; }
  .id { font-size: 11px; color: #999; } .card { cursor: pointer; }
</style></head><body>
<h1>Wortkreuz – Prüfstapel „${title}“ (${puzzles.length} Rätsel)</h1>
<p class="note">Klick auf ein Rätsel zeigt die Lösung. „Wort für Wort lösbar“: Es gibt immer ein Wort, das als einziges passt. Trägt man es ein, ergibt sich das nächste – so lässt sich das ganze Rätsel ohne Probieren füllen. „Engster Einstieg“: wie viele Wörter am Anfang in die Zeile/Spalte mit den wenigsten Möglichkeiten passen (1 = es gibt einen sicheren Startpunkt).</p>
${puzzles.map(card).join('\n')}
<script>document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => c.classList.toggle('show')))</script>
</body></html>
`
}
