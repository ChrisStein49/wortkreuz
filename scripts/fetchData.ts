// Downloads the third-party word data used by the offline generator into
// data/raw/ (gitignored). Sources and licences: see data/SOURCES.md.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const RAW = join(import.meta.dirname, '..', 'data', 'raw')
mkdirSync(RAW, { recursive: true })

const FREQ_URL =
  'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt'
// Noun and adjective lexicons derived from LanguageTool's german-pos-dict.
// Verbs are deliberately left out (no verb forms in puzzles).
const POS_PACKAGES = ['german-words-dict', 'german-adjectives-dict']
const POS_VERSION = '3.4.0'

async function download(url: string, dest: string) {
  if (existsSync(dest)) {
    console.log(`exists: ${dest}`)
    return
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`)
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  console.log(`downloaded: ${dest}`)
}

await download(FREQ_URL, join(RAW, 'de_50k.txt'))
for (const pkg of POS_PACKAGES) {
  const file = `${pkg}-${POS_VERSION}.tgz`
  await download(`https://registry.npmjs.org/${pkg}/-/${file}`, join(RAW, file))
  // npm tarballs unpack into package/; give each its own folder
  const dir = join(RAW, pkg)
  mkdirSync(dir, { recursive: true })
  execFileSync('tar', ['-xzf', join('..', file), '--strip-components=1'], { cwd: dir, stdio: 'inherit' })
  console.log(`extracted to data/raw/${pkg}/`)
}
