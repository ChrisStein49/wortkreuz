import { describe, expect, it } from 'vitest'
import { CATEGORIES } from './categories.ts'
import { UI } from './ui.ts'

describe('answer label on the solution image', () => {
  it('follows the gender of the category name', () => {
    const label = (id: string) => {
      const c = CATEGORIES.find((x) => x.id === id)!
      return UI.answerLabel(c.name, c.gender)
    }
    expect(label('country')).toBe('Gesuchtes Land:')
    expect(label('capital')).toBe('Gesuchte Hauptstadt:')
    expect(label('body')).toBe('Gesuchter Körperteil:')
    expect(label('clothing')).toBe('Gesuchtes Kleidungsstück:')
  })

  it('matches the article of every question ("Welcher/Welche/Welches")', () => {
    const article = { m: 'Welcher', f: 'Welche', n: 'Welches' }
    for (const c of CATEGORIES) expect(c.clue.startsWith(`${article[c.gender]} `), c.id).toBe(true)
  })
})
