import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// On GitHub Pages the app is served from /<repo>/. Set BASE_PATH in CI.
const base = process.env.BASE_PATH ?? '/';

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Mewing Academy',
        short_name: 'Mewing',
        description: 'Learn with your hands. Play with AI.',
        theme_color: '#ffcc00',
        background_color: '#130d2e',
        display: 'standalone',
        orientation: 'any',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell (JS/CSS/HTML/fonts) is precached. The big AI models and
        // wasm are cached at runtime the first time the camera is used.
        globPatterns: ['**/*.{js,css,html,woff,woff2,svg}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.includes('/models/') || url.pathname.includes('/wasm/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'mewing-ai-assets',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:4000',
    },
  },
});
