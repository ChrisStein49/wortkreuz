import { memo } from 'react'
import { GEESE, gooseSvg } from '../assets/gooseArt.ts'

// The SVG markup is generated from our own artwork (no user input), so
// injecting it is safe. Cached per symbol since every cell re-renders.
const MARKUP = GEESE.map((g) => gooseSvg(g))

export const Goose = memo(function Goose({ symbol, className }: { symbol: number; className?: string }) {
  return <span className={`goose ${className ?? ''}`} dangerouslySetInnerHTML={{ __html: MARKUP[symbol] }} />
})

/** Colour for letters of this goose (readable on white) */
export const gooseColor = (symbol: number) => GEESE[symbol].text
