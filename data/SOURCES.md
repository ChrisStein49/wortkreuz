# Word data sources

`de/words5.json` is derived from the following data. The app ships only
generated puzzles, never the lists themselves; credit the sources in the app.

| Source | Used for | Licence |
| --- | --- | --- |
| [german-pos-dict](https://github.com/languagetool-org/german-pos-dict) (LanguageTool), via the npm packages `german-words-dict` and `german-adjectives-dict` 3.4.0 by Ludan Stoecklé | Noun and adjective base forms with declension data | CC-BY-SA 4.0 (data), Apache-2.0 (packages) |
| [FrequencyWords](https://github.com/hermitdave/FrequencyWords) `content/2018/de/de_50k.txt` (Hermit Dave, from OpenSubtitles) | Word frequency: familiarity ranking, dropping obscure words | CC-BY-SA 4.0 |

Re-create: `npm run fetch-data` (downloads into `data/raw/`, gitignored),
then `npm run build-words`.

Filters applied in `scripts/buildWordList.ts`: exactly 5 letters A-Z (no
umlauts, no ß), nouns in nominative singular, uninflected adjectives, no
verbs, no abbreviations, no nominalised infinitives or adjectives. Manual
exclusions live in `src/lang/de/blocklist.ts`.
