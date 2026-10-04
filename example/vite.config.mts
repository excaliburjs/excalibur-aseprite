import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

/**
 * Dev server for the example page, and the server Playwright boots for the e2e suite
 * (see ../playwright.config.ts). Replaces the old webpack build + http-server two step:
 * vite serves example/index.html and transpiles main.ts (and the plugin source it aliases
 * to) on the fly, so there is no build artifact to keep in sync with the sources.
 */
export default defineConfig({
  resolve: {
    alias: {
      // Same alias the example already imports through - point it at the plugin sources so
      // the e2e suite exercises src/, not a stale build/ bundle.
      '@excalibur-aseprite': fileURLToPath(new URL('../src/index.ts', import.meta.url))
    }
  },
  server: {
    fs: {
      // main.ts imports out of example/ into ../src
      allow: [fileURLToPath(new URL('..', import.meta.url))]
    }
  }
});
