// Sanity check for the solution-word lists: A-Z only, no duplicates, and
// reports anagram pairs within a category (those words are never used, as
// the solution would be ambiguous).
//   npx tsx scripts/checkCategories.ts
import { CATEGORIES } from '../src/lang/de/categories.ts'

let total = 0
let problems = 0
for (const c of CATEGORIES) {
  const bad = c.words.filter((w) => !/^[A-Z]+$/.test(w))
  const dup = c.words.filter((w, i) => c.words.indexOf(w) !== i)
  const bySorted = new Map<string, string[]>()
  for (const w of c.words) {
    const k = [...w].sort().join('')
    bySorted.set(k, [...(bySorted.get(k) ?? []), w])
  }
  const anagrams = [...bySorted.values()].filter((v) => v.length > 1)
  total += c.words.length
  problems += bad.length + dup.length
  const notes = [
    bad.length ? `not A-Z: ${bad}` : '',
    dup.length ? `duplicates: ${dup}` : '',
    anagrams.length ? `anagrams (skipped): ${anagrams.map((a) => a.join('/')).join(', ')}` : '',
  ].filter(Boolean)
  console.log(`${c.id.padEnd(11)} ${String(c.words.length).padStart(3)}  ${notes.join('; ')}`)
}
console.log(`total ${total}`)
if (problems) process.exit(1)
