import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import pkg from './package.json' with { type: 'json' };

let commit = 'unversioned';
try {
  commit = execFileSync('git', ['rev-parse', 'HEAD'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
} catch {
  /* A source archive need not include Git metadata. */
}

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: 'build-identity',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'build-info.json',
          source: JSON.stringify({ version: pkg.version, commit }),
        });
      },
    },
  ],
  base: process.env.BASE_PATH || './',
  build: { sourcemap: false },
});
