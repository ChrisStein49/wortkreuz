// Builds the German 5-letter word list from the raw lexicons in data/raw/
// (run `npm run fetch-data` first) and writes data/de/words5.json.
//
// Keeps only base forms: nouns whose key is their nominative singular and
// uninflected adjectives. No verbs, pronouns, abbreviations or proper names
// (the noun lexicon has no proper names). Umlauts and ß are excluded, so the
// alphabet is plain A-Z. Each word gets a frequency count from the
// OpenSubtitles list, used for difficulty and to keep obscure words out of
// grids.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BLOCKLIST, NOT_A_GRID_WORD } from '../src/lang/de/blocklist.ts'

const ROOT = join(import.meta.dirname, '..')
const RAW = join(ROOT, 'data', 'raw')
const LENGTH = 5

type Forms = { SIN?: string; PLU?: string }
type NounInfo = { NOM?: Forms; AKK?: Forms; G?: 'M' | 'F' | 'N' }

// Nominalised infinitives ("das Sagen"): neuter, -en, never a plural.
// Real nouns ending in -en (Leben, Essen, Boden) have one.
function isNominalisedVerb(lemma: string, info: NounInfo) {
  return info.G === 'N' && lemma.endsWith('en') && !info.NOM?.PLU
}

// Nominalised adjectives ("das Ganze", "der Erste") are stored as neuter
// with adjective-style weak endings: Erste -> AKK Ersten.
const REAL_WEAK_NOUNS = new Set(['Junge'])
function isNominalisedAdjective(lemma: string, info: NounInfo) {
  return (
    info.G === 'N' && lemma.endsWith('e') && info.AKK?.SIN === `${lemma}n` && !REAL_WEAK_NOUNS.has(lemma)
  )
}

const nouns: Record<string, NounInfo> = JSON.parse(
  readFileSync(join(RAW, 'german-words-dict', 'dist', 'words.json'), 'utf8'),
)
const adjectives: Record<string, unknown> = JSON.parse(
  readFileSync(join(RAW, 'german-adjectives-dict', 'dist', 'adjectives.json'), 'utf8'),
)

const freq = new Map<string, number>()
for (const line of readFileSync(join(RAW, 'de_50k.txt'), 'utf8').split('\n')) {
  const [word, count] = line.trim().split(' ')
  if (word && count) freq.set(word.toLowerCase(), (freq.get(word.toLowerCase()) ?? 0) + Number(count))
}

const PLAIN = new RegExp(`^[a-zA-Z]{${LENGTH}}$`)
const excluded = new Set([...BLOCKLIST, ...NOT_A_GRID_WORD])

// `grid`: may be placed in a puzzle. Every entry, grid or not, counts as a
// valid word when the solver checks a puzzle for alternative solutions.
type Entry = { word: string; pos: 'N' | 'A'; freq: number; grid: boolean }
const entries = new Map<string, Entry>()

function add(lemma: string, pos: Entry['pos']) {
  if (!PLAIN.test(lemma)) return
  // Abbreviations show up as all-caps or with inner capitals (ADAC, GmbH)
  if (/[A-Z]/.test(lemma.slice(1))) return
  const word = lemma.toUpperCase()
  const f = freq.get(lemma.toLowerCase()) ?? 0
  const prev = entries.get(word)
  if (prev) {
    prev.freq = Math.max(prev.freq, f)
    return
  }
  entries.set(word, { word, pos, freq: f, grid: false })
}

for (const [lemma, info] of Object.entries(nouns)) {
  if (info.NOM?.SIN !== lemma) continue // plurale tantum or irregular key
  if (lemma[0] !== lemma[0].toUpperCase()) continue
  if (isNominalisedVerb(lemma, info) || isNominalisedAdjective(lemma, info)) continue
  add(lemma, 'N')
}
for (const lemma of Object.keys(adjectives)) {
  if (lemma[0] !== lemma[0].toLowerCase()) continue
  add(lemma, 'A')
}
for (const e of entries.values()) e.grid = e.freq > 0 && !excluded.has(e.word)

const list = [...entries.values()].sort((a, b) => b.freq - a.freq || a.word.localeCompare(b.word))
writeFileSync(join(ROOT, 'data', 'de', 'words5.json'), JSON.stringify(list).replace(/},{/g, '},\n{') + '\n')

const grid = list.filter((e) => e.grid)
console.log(
  `valid words ${list.length} (nouns ${list.filter((e) => e.pos === 'N').length}, adjectives ${list.filter((e) => e.pos === 'A').length})`,
)
console.log(`grid words ${grid.length}`)
