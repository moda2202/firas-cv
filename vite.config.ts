import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { writeFileSync, readFileSync } from 'fs'

// Plugin: copy index.html → 404.html so GitHub Pages handles SPA routes
function spa404Plugin() {
  return {
    name: 'spa-404',
    closeBundle() {
      const dist = resolve(__dirname, 'dist')
      const html = readFileSync(resolve(dist, 'index.html'), 'utf-8')
      writeFileSync(resolve(dist, '404.html'), html)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spa404Plugin()],
  base: "/firas-cv/",
})
