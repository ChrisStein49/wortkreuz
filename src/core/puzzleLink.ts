// Direct links to one puzzle of one day, e.g. for the newsletter:
//   https://geschnatter.ganzgraz.at/#2026-11-24/2
// The date is part of the link, so a newsletter read days later still opens
// exactly the puzzle from its image. Everything after "#" stays in the
// browser, so this works on any static host without server settings.

export interface PuzzleLink {
  /** Day, YYYY-MM-DD */
  iso: string
  /** 0-based puzzle index (the link shows 1–5) */
  index: number
}

const LINK = /^#(\d{4}-\d{2}-\d{2})\/(\d+)$/

/**
 * Reads a link from `location.hash`. Returns null for anything that isn't a
 * puzzle of a day from `firstDay` up to `today` (no playing ahead) with a
 * valid puzzle number.
 */
export function parsePuzzleLink(hash: string, today: string, firstDay: string, puzzlesPerDay: number): PuzzleLink | null {
  const m = LINK.exec(hash.trim())
  if (!m) return null
  const [, iso, num] = m
  const n = Number(num)
  if (!isRealDate(iso) || iso < firstDay || iso > today || n < 1 || n > puzzlesPerDay) return null
  return { iso, index: n - 1 }
}

/** The link to show in the newsletter, e.g. "https://…/#2026-11-24/2" */
export function puzzleLinkUrl(base: string, iso: string, index: number): string {
  return `${base.replace(/\/?$/, '/')}#${iso}/${index + 1}`
}

function isRealDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
}
