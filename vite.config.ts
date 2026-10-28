import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { pwaManifest } from './pwa-manifest';
import { appVersion } from './scripts/app-version';

// No GitHub Pages o app fica em /<repositório>/; o CI define BASE_PATH.
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  // Feature 014: versão mostrada em "Exibição" para conferir que os dois celulares estão iguais.
  define: { __APP_VERSION__: JSON.stringify(appVersion()) },
  plugins: [
    preact(),
    VitePWA({
      // Feature 014: versão nova avisada ("atualizar"), sem recarregar no meio do uso.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['icons/*.png', 'icons/*.svg', 'splash/*.png'],
      manifest: pwaManifest(base),
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,json,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 2000, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
