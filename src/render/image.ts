// Newsletter images for Geschnatter puzzles (930×497 like the hand-made ones,
// e.g. #117): the puzzle with geese, and the solution with each goose's letter
// in its colour.
//
// The frame (size, background, portrait with name) is copied from Ganszahlig
// (C:\Users\short\Projects\goose-numberpuzzles\src\render\image.ts) so both
// puzzle types look alike in the newsletter. Changes to the frame belong in
// both projects.
import type { PlayPuzzle } from '../core/codec.ts'
import { GEESE, gooseSvg } from '../assets/gooseArt.ts'

export const IMAGE_W = 930
export const IMAGE_H = 497

export type ImageMode = 'puzzle' | 'solution'

/** What an image needs besides the puzzle itself */
export interface ImageText {
  /** "Welches Land ist gesucht?" (puzzle image) */
  question: string
  /** "Gesuchtes Land:" (solution image) */
  answerLabel: string
}

export const INK = '#2a2624'
const ORANGE = '#f7931e'
const LETTER_INK = '#1d1b1a'
const BLOCKED = '#3a302e'
const GRID_LINE = '#111111'
/** Grid cells: mostly white, a little of the background shows through */
const CELL_FILL = 'rgba(255, 255, 255, 0.78)'
const UI_FONT = 'Inter, system-ui, sans-serif'
const LETTER_FONT = "'Arbutus Slab', Georgia, serif"
/** Width / height of the goose drawing (viewBox 215.67 × 247.50) */
const GOOSE_ASPECT = 215.66645 / 247.5039

// ---------- loading ----------

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`image failed: ${src.slice(0, 60)}`))
    img.src = src
  })
}

const gooseImages: HTMLImageElement[] = []

/** Preloads goose art and fonts so drawing is synchronous afterwards */
export async function prepareImages(): Promise<void> {
  const geese = await Promise.all(
    GEESE.map((g) => loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(gooseSvg(g, 'width="430" height="494"')))),
  )
  geese.forEach((img, i) => (gooseImages[i] = img))
  await Promise.all([
    document.fonts.load(`400 60px ${LETTER_FONT}`),
    document.fonts.load(`400 22px Inter`),
    document.fonts.load(`700 14px Inter`),
  ])
}

// ---------- background (copied from Ganszahlig) ----------

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

/** Shapes in a 45° rotated frame: [x, y, w, h, fill] */
const SHAPES: [number, number, number, number, string][] = [
  [-120, -520, 360, 900, 'rgba(255,255,255,0.75)'],
  [300, -620, 280, 760, 'rgba(255,255,255,0.55)'],
  [140, 120, 420, 300, 'rgba(210,210,210,0.35)'],
  [560, -300, 300, 520, 'rgba(225,225,225,0.45)'],
  [-80, 380, 520, 260, 'rgba(255,255,255,0.6)'],
  [480, 260, 340, 420, 'rgba(255,255,255,0.7)'],
  [760, -120, 260, 300, 'rgba(205,205,205,0.3)'],
  [-420, 40, 300, 520, 'rgba(215,215,215,0.35)'],
]

export function drawBackground(ctx: CanvasRenderingContext2D) {
  const g = ctx.createLinearGradient(0, 0, IMAGE_W, IMAGE_H)
  g.addColorStop(0, '#f3f3f3')
  g.addColorStop(1, '#e6e6e6')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, IMAGE_W, IMAGE_H)
  ctx.save()
  ctx.translate(IMAGE_W * 0.42, IMAGE_H * 0.1)
  ctx.rotate(Math.PI / 4)
  for (const [x, y, w, h, fill] of SHAPES) {
    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.06)'
    ctx.shadowBlur = 30
    ctx.fillStyle = fill
    roundedRect(ctx, x, y, w, h, 70)
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

/** The image background alone, e.g. as page background of the app */
export function backgroundCanvas(scale = 2): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = IMAGE_W * scale
  canvas.height = IMAGE_H * scale
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  drawBackground(ctx)
  return canvas
}

// ---------- portrait with name (copied from Ganszahlig) ----------

function drawBranding(ctx: CanvasRenderingContext2D, portrait: HTMLImageElement | null) {
  const cx = 816
  const cy = 118
  const r = 76
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = '#d9d9d9'
  ctx.fill()
  if (portrait) {
    ctx.clip()
    const s = Math.max((2 * r) / portrait.width, (2 * r) / portrait.height)
    ctx.drawImage(portrait, cx - (portrait.width * s) / 2, cy - (portrait.height * s) / 2, portrait.width * s, portrait.height * s)
  }
  ctx.restore()
  ctx.font = `700 12.5px ${UI_FONT}`
  ctx.fillStyle = ORANGE
  ctx.textAlign = 'center'
  ctx.fillText('CHRISTOPH STEINKELLNER', cx, 218)
  ctx.textAlign = 'left'
}

// ---------- text helpers ----------

/** Draws text centred on (cx, cy), optically by its capital height */
function centredText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, font: string, color: string) {
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  const cap = ctx.measureText('H').actualBoundingBoxAscent
  ctx.fillText(text, cx, cy + cap / 2)
  ctx.textAlign = 'left'
}

/** Largest font size ≤ `size` at which `text` fits into `maxWidth` */
function fitSize(ctx: CanvasRenderingContext2D, text: string, family: string, weight: number, size: number, maxWidth: number) {
  ctx.font = `${weight} ${size}px ${family}`
  const w = ctx.measureText(text).width
  return w > maxWidth ? (size * maxWidth) / w : size
}

// ---------- the grid ----------

const GRID = { x: 30, y: 26, size: 445 }

function drawGrid(ctx: CanvasRenderingContext2D, p: PlayPuzzle, mode: ImageMode) {
  const cell = GRID.size / p.size
  const letterFont = `400 ${cell * 0.64}px ${LETTER_FONT}`
  p.cells.forEach((c, i) => {
    const x = GRID.x + (i % p.size) * cell
    const y = GRID.y + Math.floor(i / p.size) * cell
    ctx.fillStyle = c.kind === 'blocked' ? BLOCKED : CELL_FILL
    ctx.fillRect(x, y, cell, cell)
    const cx = x + cell / 2
    const cy = y + cell / 2
    if (c.kind === 'given') centredText(ctx, c.letter, cx, cy, letterFont, LETTER_INK)
    if (c.kind === 'symbol') {
      if (mode === 'solution') centredText(ctx, p.key[c.symbol], cx, cy, letterFont, GEESE[c.symbol].text)
      else drawGoose(ctx, c.symbol, cx, cy, cell * 0.8)
    }
  })
  // inner lines, then the stronger outer frame
  ctx.fillStyle = GRID_LINE
  for (let k = 1; k < p.size; k++) {
    ctx.fillRect(GRID.x + k * cell - 1.25, GRID.y, 2.5, GRID.size)
    ctx.fillRect(GRID.x, GRID.y + k * cell - 1.25, GRID.size, 2.5)
  }
  ctx.lineWidth = 4
  ctx.strokeStyle = GRID_LINE
  ctx.strokeRect(GRID.x, GRID.y, GRID.size, GRID.size)
}

function drawGoose(ctx: CanvasRenderingContext2D, symbol: number, cx: number, cy: number, h: number) {
  const img = gooseImages[symbol]
  const w = h * GOOSE_ASPECT
  if (img) ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h)
}

// ---------- right side ----------

/** Centre of the right-hand panel */
const PANEL_X = 712

/**
 * The solution word's geese (and plain letters), scattered in staggered rows
 * below the question like in the hand-made images. Positions jitter a little,
 * the same way every time for the same puzzle.
 */
function drawScatteredGeese(ctx: CanvasRenderingContext2D, p: PlayPuzzle) {
  const tiles = p.solution.tiles
  const n = tiles.length
  const area = { x: 540, y: 290, w: 350, h: 185 }
  const rows = n <= 3 ? 1 : n <= 8 ? 2 : 3
  const perRow = Math.ceil(n / rows)
  const rowH = area.h / rows
  const h = Math.min(76, rowH * 0.92, (area.w / (perRow + 0.5)) / GOOSE_ASPECT)
  const step = area.w / (perRow + 0.5)
  const random = seededRandom(p.solution.word)
  tiles.forEach((t, i) => {
    const row = Math.floor(i / perRow)
    const col = i % perRow
    const inRow = Math.min(perRow, n - row * perRow)
    // centre each row; every other row shifted by half a step (staggered)
    const rowWidth = (inRow - 1) * step
    const shift = row % 2 === 1 ? step / 4 : -step / 4
    const cx = PANEL_X + shift - rowWidth / 2 + col * step + (random() - 0.5) * 12
    const cy = area.y + rowH * (row + 0.5) + (random() - 0.5) * 14
    if ('symbol' in t) drawGoose(ctx, t.symbol, cx, cy, h)
    else centredText(ctx, t.letter, cx, cy, `400 ${h * 0.62}px ${LETTER_FONT}`, LETTER_INK)
  })
}

function seededRandom(seed: string) {
  let s = [...seed].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7)
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), s | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** The solution word, each letter in the colour of its goose */
function drawSolutionWord(ctx: CanvasRenderingContext2D, p: PlayPuzzle) {
  const word = p.solution.word
  const size = fitSize(ctx, word, LETTER_FONT, 400, 74, 380)
  ctx.font = `400 ${size}px ${LETTER_FONT}`
  const spacing = size * 0.04
  const widths = [...word].map((l) => ctx.measureText(l).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (word.length - 1)
  let x = PANEL_X - total / 2
  ;[...word].forEach((l, i) => {
    const symbol = p.key.indexOf(l)
    centredText(ctx, l, x + widths[i] / 2, 292, ctx.font, symbol >= 0 ? GEESE[symbol].text : LETTER_INK)
    ctx.font = `400 ${size}px ${LETTER_FONT}`
    x += widths[i] + spacing
  })
}

// ---------- the whole image ----------

export interface DrawOptions {
  /** Pixel density of the canvas (1 = 930×497, 2 = 1860×994) */
  scale?: number
  portrait?: HTMLImageElement | null
}

export function drawImage(canvas: HTMLCanvasElement, p: PlayPuzzle, text: ImageText, mode: ImageMode, opts: DrawOptions = {}) {
  const scale = opts.scale ?? 1
  canvas.width = IMAGE_W * scale
  canvas.height = IMAGE_H * scale
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  drawBackground(ctx)
  drawGrid(ctx, p, mode)
  if (mode === 'puzzle') {
    drawBranding(ctx, opts.portrait ?? null)
    const size = fitSize(ctx, text.question, UI_FONT, 400, 22, 400)
    centredText(ctx, text.question, PANEL_X, 256, `400 ${size}px ${UI_FONT}`, INK)
    drawScatteredGeese(ctx, p)
  } else {
    const size = fitSize(ctx, text.answerLabel, UI_FONT, 400, 22, 400)
    centredText(ctx, text.answerLabel, PANEL_X, 204, `400 ${size}px ${UI_FONT}`, INK)
    drawSolutionWord(ctx, p)
  }
}
