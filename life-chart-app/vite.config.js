import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const isElectron = process.env.ELECTRON === 'true'

export default defineConfig({
  plugins: [
    react(),
    !isElectron && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['floral-bottom.png', 'apple-touch-icon-white-v2.png', 'icon-192-white-v2.png', 'icon-512-white-v2.png'],
      manifest: {
        name: "The Healer's Code — Life Chart",
        short_name: 'Life Chart',
        description: 'Sacred geometry & astrology life chart readings',
        theme_color: '#0a0a1a',
        background_color: '#0a0a1a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'icon-192-white-v2.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512-white-v2.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
      },
    }),
  ].filter(Boolean),
  // Use relative assets so the PWA works from the GitHub Pages subfolder
  // /Apps/life-chart-app/docs/ as well as local/Electron builds.
  base: './',
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist'
  }
})
