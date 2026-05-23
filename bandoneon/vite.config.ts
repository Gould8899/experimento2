import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';
import vue from '@vitejs/plugin-vue';
import VueRouter from 'unplugin-vue-router/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function resolveGithubPagesBase() {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return '/';

  const [, repoName] = repository.split('/');
  if (!repoName || repoName.endsWith('.github.io')) return '/';

  return `/${repoName}/`;
}

export default defineConfig(() => ({
  base:
    process.env.GITHUB_ACTIONS === 'true' ? resolveGithubPagesBase() : '/',
  plugins: [
    tailwindcss(),
    VueRouter(),
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    VitePWA({
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Bandoneon.app',
        short_name: 'Bandoneon',
        display: 'standalone',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
}));
