# Wortkreuz

Puzzle app for the newsletter puzzles, starting with the letter puzzle.
(Working title.)

## Letter puzzle rules

A 5×5 grid with words in rows 1, 3, 5 and columns 1, 3, 5. Some letters are
printed; the others are coloured symbols.

1. The same symbol is always the same letter.
2. Different symbols are different letters.
3. A symbol never stands for a letter printed in the grid.
4. All six rows and columns are valid words (base forms only).

The decoded letters of the solution symbols, rearranged, give the solution
word for the clue (e.g. "Welches Land ist gesucht?").

## Layout

- `src/core/` – language-independent: grid template, solver, generator
- `src/lang/de/` – German pack: alphabet, solution categories, blocklist
- `data/de/words5.json` – German 5-letter word list (see `data/SOURCES.md`)
- `scripts/` – offline tooling (data fetch, word list build, puzzle generation)

## Generator

```
npm run fetch-data        # once: download source word data
npm run build-words       # rebuild data/de/words5.json
npm run generate -- mittel 12 1   # preset (leicht|mittel|schwer), count, seed
npm run review            # browse scripts/out/*.html
```

Every generated puzzle is checked to have exactly one solution against the
full valid-word list (wider than the words placed in grids).

## Daily calendar

Five puzzles per day, the same for everyone, stored in
`src/data/daily-de.json` (compact format, see `src/core/codec.ts`).
Weekdays run leicht, leicht, mittel, mittel, schwer; Saturday and Sunday
leicht, mittel, mittel, schwer, schwer (`src/core/schedule.ts`).

```
npm run build-daily -- 365      # append a year after the last existing day
npx tsx scripts/checkDaily.ts   # re-verify every puzzle and print stats
```

Existing days are never regenerated, so past days (the archive) stay
stable. Each day uses five different categories; solution words are spaced
at least 60 days apart where possible, grid words a few days apart.
`scripts/out/daily.html` shows the first two weeks of each new batch.
