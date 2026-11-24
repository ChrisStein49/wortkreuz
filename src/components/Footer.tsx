import { UI } from '../lang/de/ui.ts'
import { GANZGRAZ_URL, MORE_GAMES_URL } from '../publicUrl.ts'

interface Props {
  onRules: () => void
  /** Leads to the archive list; null hides the link (e.g. when already in the archive) */
  onArchive: (() => void) | null
}

/** ganzgraz footer shared by the overview, past days and the game screen */
export function Footer({ onRules, onArchive }: Props) {
  return (
    <footer className="footer">
      <div className="footer-text">
        <div className="links">
          <button type="button" onClick={onRules}>{UI.rules}</button>
          {onArchive && <button type="button" onClick={onArchive}>{UI.archive}</button>}
        </div>
        <a className="more-link" href={MORE_GAMES_URL} target="_blank" rel="noopener noreferrer">{UI.moreGames}</a>
      </div>
      <a className="footer-logo" href={GANZGRAZ_URL} target="_blank" rel="noopener noreferrer">
        <img src="/ganzgraz-logo.webp" alt="ganzgraz" />
      </a>
    </footer>
  )
}
