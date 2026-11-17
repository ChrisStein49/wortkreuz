import react from '@vitejs/plugin-react'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { defineConfig, type Plugin } from 'vite'

const ROOT = import.meta.dirname
const EXPORTS = join(ROOT, 'exports')

/**
 * Local-only helper for the PNG exporter (export.html): saves the images it
 * sends to exports/. Exists on the dev server only, never in the build.
 */
function exportApi(): Plugin {
  return {
    name: 'export-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/export-api', (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }
        const name = decodeURIComponent((req.url ?? '/').slice(1))
        if (req.method !== 'PUT' || !/^[\w -]+ (puzzle|solution)\.png$/.test(name)) return send(400, { error: 'bad request' })
        const chunks: Buffer[] = []
        req.on('data', (c: Buffer) => chunks.push(c))
        req.on('end', () => {
          try {
            mkdirSync(EXPORTS, { recursive: true })
            writeFileSync(join(EXPORTS, name), Buffer.concat(chunks))
            send(200, { path: `exports/${name}` })
          } catch (err) {
            send(500, { error: String(err) })
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), exportApi()],
  // 5173 is Go Goose's dev port, 5175 Ganszahlig's
  server: { port: 5174, strictPort: true },
  // only the app is built; export.html (PNG exporter) is served by the dev server alone
  build: { rollupOptions: { input: join(ROOT, 'index.html') } },
})
