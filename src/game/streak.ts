// Streak: consecutive days with at least STREAK_MIN_SOLVED puzzles solved.
// Today only adds to the streak once it counts; while it's still in progress
// it doesn't break a streak that ran until yesterday.

export const STREAK_MIN_SOLVED = 3

/**
 * @param today local calendar date
 * @param solvedOn number of puzzles solved on a given day (YYYY-MM-DD)
 * @param firstDay earliest day that can count (calendar start)
 */
export function currentStreak(today: Date, solvedOn: (iso: string) => number, firstDay: string): number {
  const counts = (d: Date) => solvedOn(isoDay(d)) >= STREAK_MIN_SOLVED
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (!counts(day)) day.setDate(day.getDate() - 1)
  let streak = 0
  while (isoDay(day) >= firstDay && counts(day)) {
    streak++
    day.setDate(day.getDate() - 1)
  }
  return streak
}

function isoDay(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
