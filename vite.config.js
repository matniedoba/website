import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// The site is served at the root of the custom domain (matniedoba.de), so assets
// resolve from "/". Set VITE_BASE=/website/ to build for the bare project-page URL
// at https://matniedoba.github.io/website/ instead.
const PROD_BASE = process.env.VITE_BASE || '/'

// GitHub Pages has no server-side rewrite, so a direct hit on /website/some-subpage
// would 404. Shipping a copy of index.html as 404.html makes Pages hand those
// requests back to the SPA, which then renders the right route.
function spaFallback() {
  return {
    name: 'spa-404-fallback',
    closeBundle() {
      const dist = resolve(import.meta.dirname, 'dist')
      copyFileSync(resolve(dist, 'index.html'), resolve(dist, '404.html'))
    },
  }
}

export default defineConfig(({ command }) => ({
  base: command === 'build' ? PROD_BASE : '/',
  plugins: [react(), spaFallback()],
  server: {
    // Deliberately off Vite's default 5173, which tends to be occupied by other
    // dev servers. Vite falls forward to the next free port if this one is taken.
    port: 5180,
  },
}))
