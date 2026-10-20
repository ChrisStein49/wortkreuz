import { UI } from '../lang/de/ui.ts'
import { Goose } from './Goose.tsx'

export function Rules({ onClose }: { onClose: () => void }) {
  return (
    <div className="screen rules">
      <header className="bar">
        <button type="button" className="back" onClick={onClose} aria-label={UI.back}>‹</button>
        <div className="bar-title">{UI.rulesTitle}</div>
      </header>
      <div className="rules-geese" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((s) => <Goose key={s} symbol={s} />)}
      </div>
      <p className="rules-goal">{UI.rulesGoal}</p>
      <ol className="rules-list">
        {UI.rulesText.map((t) => <li key={t}>{t}</li>)}
      </ol>
      <button type="button" className="btn primary" onClick={onClose}>{UI.rulesClose}</button>
    </div>
  )
}
