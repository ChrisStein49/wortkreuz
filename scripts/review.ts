// HTML review pages: puzzles as the player sees them, solution revealed on
// click, with generator stats. Shared by the batch and calendar scripts.
import type { LetterPuzzle } from '../src/core/types.ts'

export interface ReviewSection {
  heading?: string
  puzzles: { puzzle: LetterPuzzle; label?: string }[]
}

// Six clearly distinct colours: red, orange, green, blue, pink, black
const COLORS = ['#d62828', '#f28c00', '#2e9e44', '#1f5fd1', '#e85aa8', '#222222']

export function letterAt(p: LetterPuzzle, i: number) {
  const c = p.cells[i]
  return c.kind === 'given' ? c.letter : c.kind === 'symbol' ? p.key[c.symbol] : ''
}

export function rowWord(p: LetterPuzzle, r: number) {
  return Array.from({ length: p.size }, (_, c) => letterAt(p, r * p.size + c)).join('')
}

/** One-line summary for console output */
export function summary(p: LetterPuzzle) {
  const d = p.stats.deduction
  const words = [0, 2, 4].map((r) => rowWord(p, r)).join(' ')
  return (
    `${words}  -> ${p.solution.word.padEnd(9)} plain ${p.stats.plainSolutionLetters} sym ${p.stats.symbols} ` +
    `given ${p.stats.givenCells} cells/${p.stats.givenLetters} letters rank ${p.stats.meanWordRank}/${p.stats.maxWordRank}  ` +
    `word-by-word ${d.forced ? 'Y' : `${d.forcedWords}/6`} open ${d.openingChoices}`
  )
}

const disc = (s: number) => `<span class="disc" style="background:${COLORS[s]}"></span>`

function card(p: LetterPuzzle, label?: string) {
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
    ${label ? `<p class="label">${label}</p>` : ''}
    <p class="clue">${p.solution.clue}</p>
    <div class="hint">${p.solution.tiles.map((t) => ('symbol' in t ? disc(t.symbol) : `<span class="plain">${t.letter}</span>`)).join('')}</div>
    <p class="answer">${p.solution.word}</p>
    <table>
      <tr><td>Symbole</td><td>${p.stats.symbols}</td></tr>
      <tr><td>Lösungsbuchstaben ohne Symbol</td><td>${p.stats.plainSolutionLetters}</td></tr>
      <tr><td>Vorgegebene Felder (verschiedene Buchstaben)</td><td>${p.stats.givenCells} (${p.stats.givenLetters})</td></tr>
      <tr><td>Wort-Rang Ø / max</td><td>${p.stats.meanWordRank} / ${p.stats.maxWordRank}</td></tr>
      <tr><td>Wort für Wort lösbar</td><td>${d.forced ? '✓' : `✗ – nach ${d.forcedWords} von 6 Wörtern muss man probieren`}</td></tr>
      <tr><td>Passende Wörter am engsten Einstieg</td><td>${d.openingChoices}</td></tr>
    </table>
    <p class="id">${p.id}</p>
  </div>
</section>`
}

export function reviewPage(title: string, sections: ReviewSection[]) {
  const count = sections.reduce((n, s) => n + s.puzzles.length, 0)
  const body = sections
    .map((s) => (s.heading ? `<h2>${s.heading}</h2>\n` : '') + s.puzzles.map((x) => card(x.puzzle, x.label)).join('\n'))
    .join('\n')
  return `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wortkreuz – ${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@600&family=Inter:wght@400;600&display=swap" rel="stylesheet">
<style>
  body { font-family: Inter, sans-serif; background: #eee; margin: 0; padding: 16px; color: #222; }
  h1 { font-size: 20px; } h2 { font-size: 17px; margin: 28px 0 0; } .note { color: #555; max-width: 60em; }
  .card { display: flex; flex-wrap: wrap; gap: 24px; background: #fff; border-radius: 8px; padding: 16px; margin: 16px 0; cursor: pointer; }
  .grid { display: grid; grid-template-columns: repeat(5, 56px); border: 3px solid #111; width: max-content; }
  .cell { width: 56px; height: 56px; box-sizing: border-box; border: 1px solid #999; display: flex; align-items: center;
          justify-content: center; font: 600 30px 'Noto Serif', serif; position: relative; background: #f7f7f7; }
  .blocked { background: #3a302e; }
  .disc { display: inline-block; width: 34px; height: 34px; border-radius: 50%; border: 1.5px solid #555; box-sizing: border-box; }
  .cell b { position: absolute; inset: 0; display: none; align-items: center; justify-content: center; background: #f7f7f7; }
  .card.show .cell b { display: flex; }
  .hint { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; } .hint .disc { width: 30px; height: 30px; }
  .plain { width: 30px; text-align: center; font: 600 24px 'Noto Serif', serif; }
  .answer { display: none; font: 600 28px 'Noto Serif', serif; letter-spacing: 2px; }
  .card.show .answer { display: block; }
  .label { font-weight: 600; margin: 0 0 6px; color: #555; }
  .clue { font-size: 17px; margin-top: 0; }
  table { font-size: 13px; color: #444; border-collapse: collapse; } td { padding: 2px 10px 2px 0; }
  .id { font-size: 11px; color: #999; }
</style></head><body>
<h1>Wortkreuz – ${title} (${count} Rätsel)</h1>
<p class="note">Klick auf ein Rätsel zeigt die Lösung. „Wort für Wort lösbar“: Es gibt immer ein Wort, das als einziges passt. Trägt man es ein, ergibt sich das nächste – so lässt sich das ganze Rätsel ohne Probieren füllen. „Engster Einstieg“: wie viele Wörter am Anfang in die Zeile/Spalte mit den wenigsten Möglichkeiten passen (1 = es gibt einen sicheren Startpunkt).</p>
${body}
<script>document.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => c.classList.toggle('show')))</script>
</body></html>
`
}
