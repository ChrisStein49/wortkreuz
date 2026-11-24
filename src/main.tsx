import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted fonts (no requests to Google): Arbutus Slab as in the
// newsletter for the grid letters, Inter for interface text, League Spartan
// for the app title (as in Go Goose)
import '@fontsource/arbutus-slab/latin-400.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import '@fontsource/league-spartan/latin-700.css'
import App from './App.tsx'
import { backgroundCanvas } from './render/image.ts'
import './styles.css'

// Same light grey diagonal background as the newsletter images (and Ganszahlig), behind every screen
const bg = backgroundCanvas()
bg.className = 'page-bg'
bg.setAttribute('aria-hidden', 'true')
document.body.prepend(bg)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
