import { defineConfig, devices } from '@playwright/test';

// Defaults to core's port. Overridable so several excalibur plugin repos can run their
// e2e suites side by side on one machine without silently reusing each other's dev server
// (reuseExistingServer below would happily attach to whatever is already on the port).
const port = Number(process.env.EX_E2E_PORT ?? 4173);

/**
 * Mirrors excalibur core's playwright.config.ts so the golden masters recorded here
 * reproduce byte-for-byte against core's own suite (same viewport, same GL backend, same
 * device scale factor). The launchOptions below are the load bearing part - changing them
 * invalidates every baseline in test/e2e/*-snapshots.
 */
export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  // Matches core: swiftshader-rendered scenes can back up the GPU command queue under high
  // parallelism. Override with --workers if your machine has more headroom.
  workers: 2,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    screenshot: 'off',
    trace: 'off'
  },
  webServer: {
    command: `npx vite example --port ${port} --strictPort`,
    port,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Match the rendering-consistency args used by excalibur core's e2e + visual suites
        // so screenshots are deterministic across machines/OSes.
        launchOptions: {
          ignoreDefaultArgs: ['--disable-render-backgrounding', '--disable-remote-fonts', '--font-render-hinting'],
          args: [
            '--no-default-browser-check',
            '--no-first-run',
            '--disable-default-apps',
            '--disable-popup-blocking',
            '--disable-translate',
            '--disable-background-timer-throttling',
            '--disable-dev-shm-usage',
            '--disable-renderer-backgrounding',
            '--disable-device-discovery-notifications',
            '--autoplay-policy=no-user-gesture-required',
            '--mute-audio',
            '--force-device-scale-factor=1',
            '--use-gl=swiftshader'
          ]
        }
      }
    }
  ]
});
