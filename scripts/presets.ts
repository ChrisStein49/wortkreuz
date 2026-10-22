// Generator settings per difficulty, shared by the review batches and the
// daily calendar. At most 6 symbols so the colours stay easy to tell apart.
// "easy" aims at the printed newsletter: readers can't try letters out, so it
// must be fillable word by word.
import words5 from '../data/de/words5.json' with { type: 'json' }
import type { GeneratorOptions } from '../src/core/generator.ts'
import { CLASSIC_5 } from '../src/core/grid.ts'
import type { Difficulty } from '../src/core/schedule.ts'
import { ALPHABET, CATEGORIES, LANG } from '../src/lang/de/index.ts'

type Preset = Pick<
  GeneratorOptions,
  'maxWordRank' | 'symbols' | 'minGivenCells' | 'requireForced' | 'maxPlainSolutionLetters' | 'solutionLength' | 'wellKnownSolutionsOnly'
>

const PRESETS: Record<Difficulty, Preset> = {
  easy: { maxWordRank: 400, symbols: { min: 4, max: 5 }, minGivenCells: 10, requireForced: true, maxPlainSolutionLetters: 2, solutionLength: { min: 4, max: 7 }, wellKnownSolutionsOnly: true },
  medium: { maxWordRank: 650, symbols: { min: 5, max: 6 }, minGivenCells: 8, requireForced: true, maxPlainSolutionLetters: 2, solutionLength: { min: 5, max: 8 } },
  hard: { maxWordRank: 900, symbols: { min: 6, max: 6 }, minGivenCells: 6, requireForced: false, maxPlainSolutionLetters: 2, solutionLength: { min: 5, max: 9 } },
}

/** German names used on the command line and in review pages */
export const DIFFICULTY_NAMES: Record<Difficulty, string> = { easy: 'leicht', medium: 'mittel', hard: 'schwer' }

export function generatorOptions(difficulty: Difficulty): GeneratorOptions {
  return {
    lang: LANG,
    alphabet: ALPHABET,
    template: CLASSIC_5,
    words: words5,
    categories: CATEGORIES,
    plainSolutionShare: 0.25,
    easyCategoryWeight: 0.3,
    maxGivenCells: 14,
    ...PRESETS[difficulty],
  }
}
