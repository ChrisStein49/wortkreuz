// Grid words that must never be placed in a German puzzle. They still count
// as valid words when checking a puzzle for alternative solutions, since a
// player may well think of them. Uppercase, A-Z only.

// Offensive, crude or otherwise unsuitable for a general-audience newsletter
export const BLOCKLIST: readonly string[] = [
  'ARIER', 'ARSCH', 'BUSEN', 'BUSSI', 'CRACK', 'DIRNE', 'FIXER', 'FOTZE', 'HEINI',
  'HODEN', 'ISLAM', 'JOINT', 'KACKE', 'KOTZE', 'LESBE', 'LUDER', 'NEGER', 'NUTTE',
  'OPIUM', 'PENIS', 'POPEL', 'PORNO', 'PUTZE', 'RUSSE', 'STASI', 'SYRER', 'TITTE',
  'TRINE', 'TUNTE',
]

// Found in manual review of the frequency-ranked list: inflected or
// homograph forms whose frequency comes from another word, words used only
// in fixed phrases, English words not established in German, and names.
export const NOT_A_GRID_WORD: readonly string[] = [
  // homographs / inflected forms / fixed phrases
  'BIEGE', 'BEUGE', 'DRITT', 'EIERN', 'EINER', 'EKELN', 'GETAN', 'LACHE', 'LETZT',
  'MACHE', 'MEIST', 'PINKE', 'PULLE', 'QUERE', 'RASTE', 'SOLCH', 'UFERN', 'UNGUT',
  'UNTER', 'VIERT', 'WARTE', 'ZWEIT', 'NICKI',
  // English
  'AFTER', 'BREAK', 'CLOUD', 'COMBO', 'CORPS', 'DINER', 'DRIVE', 'FIRST', 'GRAND',
  'IMAGE', 'LUNCH', 'MODEL', 'ORDER', 'PAPER', 'PHOTO', 'POWER', 'PRIME', 'QUEEN',
  'QUEUE', 'SPEED', 'STORE', 'STRIP', 'SWING', 'TIMES', 'TWEET', 'WAGON',
  // names, brands, places
  'BAMBI', 'DOLAN', 'GOUDA', 'HORST', 'KANNA', 'KREML', 'MASSA', 'MEKKA', 'MINNA',
  'SIGMA', 'TERRA', 'VESPA',
]
