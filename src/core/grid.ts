// Grid template: which cells are blocked and which cell runs form words.
// The newsletter format is 5x5 with words in rows and columns 0, 2 and 4;
// other shapes only need a different template.

export interface Template {
  size: number
  blocked: ReadonlySet<number>
  /** Each slot is the cell indices of one word, in reading order */
  slots: readonly (readonly number[])[]
}

function lineTemplate(size: number, lines: number[]): Template {
  const blocked = new Set<number>()
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (!lines.includes(r) && !lines.includes(c)) blocked.add(r * size + c)
  const slots: number[][] = []
  for (const r of lines) slots.push(Array.from({ length: size }, (_, c) => r * size + c))
  for (const c of lines) slots.push(Array.from({ length: size }, (_, r) => r * size + c))
  return { size, blocked, slots }
}

/** 5x5, words in rows 0/2/4 and columns 0/2/4: slots 0-2 rows, 3-5 columns */
export const CLASSIC_5: Template = lineTemplate(5, [0, 2, 4])
