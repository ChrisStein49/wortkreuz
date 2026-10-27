// Builds the app icons from the orange goose (the app's mark) into public/:
// favicon.svg for browser tabs, PNGs for the home screen (iPhone shows
// transparent icons on black, so those get the app's light background) and
// manifest.webmanifest so Android shows name and icon.
//   npx tsx scripts/buildIcons.ts
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import sharp from 'sharp'
import { GEESE, gooseSvg } from '../src/assets/gooseArt.ts'
import { UI } from '../src/lang/de/ui.ts'

const PUBLIC = join(import.meta.dirname, '..', 'public')
const GOOSE = GEESE[1] // orange
const BACKGROUND = '#faf8f5' // --paper in styles.css

// The goose drawing is taller than wide (215 x 247): centre it in a square
function squareSvg(padding: number, background?: string) {
  const inner = gooseSvg(GOOSE, `x="${padding}" y="${padding}" width="${100 - 2 * padding}" height="${100 - 2 * padding}"`)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    (background ? `<rect width="100" height="100" fill="${background}"/>` : '') +
    inner +
    '</svg>'
  )
}

writeFileSync(join(PUBLIC, 'favicon.svg'), squareSvg(2))

const png = (size: number, padding: number, file: string) =>
  sharp(Buffer.from(squareSvg(padding, BACKGROUND)), { density: 300 }).resize(size, size).png().toFile(join(PUBLIC, file))

await png(180, 12, 'apple-touch-icon.png')
await png(192, 12, 'icon-192.png')
// maskable: Android may crop to a circle, so keep the goose inside the middle 80%
await png(512, 18, 'icon-512.png')

writeFileSync(
  join(PUBLIC, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: UI.appName,
      short_name: UI.appName,
      lang: 'de',
      start_url: '/',
      display: 'standalone',
      background_color: BACKGROUND,
      theme_color: BACKGROUND,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
)
console.log('wrote favicon.svg, apple-touch-icon.png, icon-192.png, icon-512.png, manifest.webmanifest')
