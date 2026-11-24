// Local PNG exporter for the newsletter: pick a day and puzzle from the
// Geschnatter calendar, preview the puzzle and solution images, save both to
// exports/ (through the dev server, see vite.config.ts).
import { useEffect, useMemo, useRef, useState } from 'react'
import { fromIsoDate, puzzlesFor, toIsoDate, type Calendar } from '../core/calendar.ts'
import { puzzleLinkUrl } from '../core/puzzleLink.ts'
import { PUBLIC_URL } from '../publicUrl.ts'
import { dailyDifficulties } from '../core/schedule.ts'
import daily from '../data/daily-de.json'
import { CATEGORIES } from '../lang/de/index.ts'
import { UI } from '../lang/de/ui.ts'
import { drawImage, IMAGE_H, IMAGE_W, loadImage, prepareImages, type ImageMode } from '../render/image.ts'

const calendar = daily as Calendar
const CATEGORY = new Map(CATEGORIES.map((c) => [c.id, c]))
const firstDay = calendar.start
const lastDay = (() => {
  const d = fromIsoDate(calendar.start)
  d.setDate(d.getDate() + calendar.days.length - 1)
  return toIsoDate(d)
})()

// Your own portrait (assets/brand/portrait.png or .jpg) wins over the placeholder, as in Ganszahlig
const PORTRAITS = import.meta.glob('../../assets/brand/portrait*.{png,jpg,jpeg}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>
const portraitUrl = Object.entries(PORTRAITS).sort(([a], [b]) => Number(a.includes('placeholder')) - Number(b.includes('placeholder')))[0]?.[1]

const MODES: ImageMode[] = ['puzzle', 'solution']



export function Exporter() {
  const [iso, setIso] = useState(() => {
    const today = toIsoDate(new Date())
    return today >= firstDay && today <= lastDay ? today : firstDay
  })
  const [index, setIndex] = useState(0)
  const [number, setNumber] = useState('')
  const [scale, setScale] = useState(1)
  const [ready, setReady] = useState(false)
  const [portrait, setPortrait] = useState<HTMLImageElement | null>(null)
  const [status, setStatus] = useState('')
  const [copied, setCopied] = useState(false)
  const canvases = useRef<Record<ImageMode, HTMLCanvasElement | null>>({ puzzle: null, solution: null })

  useEffect(() => {
    void prepareImages().then(() => setReady(true))
    if (portraitUrl) void loadImage(portraitUrl).then(setPortrait)
  }, [])

  const date = useMemo(() => fromIsoDate(iso), [iso])
  const puzzles = useMemo(() => puzzlesFor(calendar, date), [date])
  const levels = dailyDifficulties(date)
  const puzzle = puzzles?.[index]
  const category = puzzle ? CATEGORY.get(puzzle.solution.categoryId) : undefined
  const text = category
    ? { question: category.clue, answerLabel: UI.answerLabel(category.name, category.gender) }
    : { question: '', answerLabel: '' }

  // previews always at double density, so they look sharp
  useEffect(() => {
    if (!ready || !puzzle) return
    for (const mode of MODES) {
      const canvas = canvases.current[mode]
      if (canvas) drawImage(canvas, puzzle, text, mode, { portrait, scale: 2 })
    }
    setStatus('')
  }, [ready, puzzle, portrait]) // eslint-disable-line react-hooks/exhaustive-deps

  const baseName = number.trim() || `${iso} ${index + 1}`
  const link = puzzleLinkUrl(PUBLIC_URL, iso, index)
  useEffect(() => setCopied(false), [link])
  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopied(true)
  }

  const save = async () => {
    if (!puzzle) return
    setStatus('Speichere …')
    try {
      const saved: string[] = []
      for (const mode of MODES) {
        const canvas = document.createElement('canvas')
        drawImage(canvas, puzzle, text, mode, { portrait, scale })
        const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), 'image/png'))
        const name = `${baseName} ${mode}.png`
        const res = await fetch(`/export-api/${encodeURIComponent(name)}`, { method: 'PUT', body: blob })
        const body = (await res.json()) as { path?: string; error?: string }
        if (!res.ok) throw new Error(body.error ?? res.statusText)
        saved.push(body.path!)
      }
      setStatus(`Gespeichert: ${saved.join(', ')}`)
    } catch (err) {
      setStatus(`Fehler: ${String(err)}`)
    }
  }

  return (
    <div className="exporter">
      <h1>Geschnatter – PNG-Export</h1>
      <p className="hint">Nur lokal: Diese Seite läuft nur auf dem Entwicklungsserver und wird nicht veröffentlicht.</p>

      <div className="controls">
        <label>
          Datum
          <input type="date" value={iso} min={firstDay} max={lastDay} onChange={(e) => e.target.value && setIso(e.target.value)} />
        </label>
        <label>
          Rätsel
          <select value={index} onChange={(e) => setIndex(Number(e.target.value))}>
            {(puzzles ?? []).map((p, i) => (
              <option key={i} value={i}>
                {i + 1} · {UI.difficulty[levels[i]]} · {CATEGORY.get(p.solution.categoryId)?.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Newsletter-Nr. (optional)
          <input type="text" value={number} placeholder="z. B. 121" onChange={(e) => setNumber(e.target.value.replace(/[^\w -]/g, ''))} />
        </label>
        <label>
          Größe
          <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
            <option value={1}>{IMAGE_W} × {IMAGE_H}</option>
            <option value={2}>{IMAGE_W * 2} × {IMAGE_H * 2}</option>
          </select>
        </label>
        <button type="button" onClick={save} disabled={!ready || !puzzle}>
          PNGs speichern
        </button>
      </div>

      {puzzle && (
        <p className="info">
          Lösung: <b>{puzzle.solution.word}</b> · Dateien: <code>exports/{baseName} puzzle.png</code>, <code>exports/{baseName} solution.png</code>
        </p>
      )}
      {puzzle && (
        <p className="link">
          Link für den Newsletter: <a href={link} target="_blank" rel="noreferrer">{link}</a>
          <button type="button" onClick={copyLink}>{copied ? 'Kopiert ✓' : 'Link kopieren'}</button>
        </p>
      )}
      {status && <p className="status">{status}</p>}

      <div className="previews">
        {MODES.map((mode) => (
          <figure key={mode}>
            <canvas ref={(el) => void (canvases.current[mode] = el)} />
            <figcaption>{mode === 'puzzle' ? 'Rätsel' : 'Lösung'}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}
