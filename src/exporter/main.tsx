// Entry of the local PNG exporter (export.html). Not part of the app build.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/arbutus-slab/latin-400.css'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-700.css'
import { Exporter } from './Exporter.tsx'
import './exporter.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Exporter />
  </StrictMode>,
)
