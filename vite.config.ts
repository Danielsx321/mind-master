import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: { target: 'es2022', cssMinify: true, sourcemap: false },
  plugins: [
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'fonts/*.woff2', 'og.png'],
      manifest: {
        name: 'Mind Master',
        short_name: 'Mind Master',
        description: 'Five quick brain games: memory, sequences, patterns, reaction and focus. Works offline.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#070d18',
        theme_color: '#070d18',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,woff2,png,svg}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
