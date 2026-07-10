import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // injectManifest lets us author the service worker (src/sw.ts) so we can add
      // push handlers; the plugin injects the offline-cache manifest into it.
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      injectRegister: null, // registered manually via useRegisterSW in main.tsx
      devOptions: { enabled: true, type: 'module' },
      manifest: {
        name: 'Camply',
        short_name: 'Camply',
        description: 'The operating system for camps',
        lang: 'en',
        theme_color: '#0A5039',
        background_color: '#f4f1ea',
        display: 'standalone',
        scope: '/',
        start_url: '/camp/home',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      // Proxy API calls to the Express backend during development
      '/api': 'http://localhost:4000',
    },
  },
  // Allow the production `preview` server to be reached through a Cloudflare quick
  // tunnel (https://*.trycloudflare.com) — needed to install/test the PWA on a phone
  // over HTTPS. The leading dot matches any random tunnel subdomain.
  preview: {
    allowedHosts: ['.trycloudflare.com'],
  },
})
