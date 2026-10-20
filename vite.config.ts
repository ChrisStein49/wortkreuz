import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 5173 is Go Goose's dev port
  server: { port: 5174, strictPort: true },
})
