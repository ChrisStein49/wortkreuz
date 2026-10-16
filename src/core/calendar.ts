// The daily calendar: five packed puzzles per day from a start date on.
// Days are counted on the player's local calendar date.
import { unpackPuzzle, type PlayPuzzle } from './codec.ts'

export interface Calendar {
  /** First day, YYYY-MM-DD */
  start: string
  /** days[i] = the packed puzzles of start + i days, in play order */
  days: string[][]
}

export function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${m}-${d}`
}

/** Local calendar date from YYYY-MM-DD */
export function fromIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Whole days from `start` to `date` (both read as calendar dates, DST-safe) */
export function dayIndex(start: string, date: Date): number {
  const [y, m, d] = start.split('-').map(Number)
  return Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(y, m - 1, d)) / 86_400_000)
}

/** The day's puzzles, or null if the calendar doesn't cover that date */
export function puzzlesFor(calendar: Calendar, date: Date): PlayPuzzle[] | null {
  const day = calendar.days[dayIndex(calendar.start, date)]
  return day ? day.map(unpackPuzzle) : null
}
