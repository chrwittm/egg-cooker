import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const identity = { experiment: 'media-lab-1', sourceCommit };
export default defineConfig({
  root: 'experiments/media',
  base: './',
  publicDir: false,
  define: { __MEDIA_LAB_BUILD__: JSON.stringify(identity) },
  plugins: [
    svelte({
      configFile: fileURLToPath(new URL('./svelte.config.js', import.meta.url)),
    }),
    {
      name: 'media-lab-identity',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'build-info.json',
          source: JSON.stringify(identity),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'manifest.webmanifest',
          source: JSON.stringify({
            id: './',
            name: 'Egg Cooker Media Lab',
            short_name: 'Media Lab',
            start_url: './',
            scope: './',
            display: 'standalone',
            background_color: '#f8f5ec',
            theme_color: '#f8f5ec',
          }),
        });
      },
    },
  ],
  build: {
    outDir: fileURLToPath(new URL('./out/media-lab', import.meta.url)),
    emptyOutDir: true,
  },
});
