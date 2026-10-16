// Difficulty of the five daily puzzles. Two curves alternate: the gentler one
// on weekdays, the harder one at the weekend when players have more time.

export type Difficulty = 'easy' | 'medium' | 'hard'

export const PUZZLES_PER_DAY = 5

const WEEKDAY: readonly Difficulty[] = ['easy', 'easy', 'medium', 'medium', 'hard']
const WEEKEND: readonly Difficulty[] = ['easy', 'medium', 'medium', 'hard', 'hard']

/** Difficulties for the given calendar day (local date), in play order */
export function dailyDifficulties(date: Date): readonly Difficulty[] {
  const day = date.getDay() // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6 ? WEEKEND : WEEKDAY
}
