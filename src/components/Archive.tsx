import { UI } from '../lang/de/ui.ts'

export interface ArchiveDay {
  date: Date
  iso: string
  solved: number
  total: number
}

interface Props {
  days: ArchiveDay[]
  onOpen: (iso: string) => void
  onBack: () => void
}

// Deliberately simple: a short list of recent days, no calendar, no stats.
// It should feel like "missed something? no problem", not like homework.
export function Archive({ days, onOpen, onBack }: Props) {
  return (
    <div className="screen archive">
      <header className="bar">
        <button type="button" className="back" onClick={onBack} aria-label={UI.back}>‹</button>
        <div className="bar-title">{UI.archiveTitle}</div>
      </header>
      <p className="archive-intro">{UI.archiveIntro}</p>
      {days.length === 0 && <p className="archive-note">{UI.archiveEmpty}</p>}
      {days.map((d) => {
        const all = d.solved === d.total
        return (
          <button key={d.iso} type="button" className={`card day${all ? ' done' : ''}`} onClick={() => onOpen(d.iso)}>
            <span className="card-info">{UI.date(d.date)}</span>
            <span className="card-right">
              {all ? UI.archiveAllSolved : d.solved > 0 ? `${d.solved} / ${d.total}` : UI.archiveNone}
            </span>
          </button>
        )
      })}
    </div>
  )
}
