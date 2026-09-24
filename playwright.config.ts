import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  // Stop the whole run after 10 minutes on CI so a stall reports partial results instead of hanging.
  globalTimeout: process.env.CI ? 10 * 60_000 : undefined,
  reporter: process.env.CI ? [['line'], ['github']] : 'list',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 5'] } }],
  webServer: {
    // CI builds in its own step (with VITE_E2E=1) so this only serves; locally it builds first.
    // The vite binary is called directly: through the pnpm wrapper the server outlives the test run on Linux and the step hangs.
    command: process.env.CI
      ? './node_modules/.bin/vite preview --host 127.0.0.1 --port 4173 --strictPort'
      : 'VITE_E2E=1 pnpm build && ./node_modules/.bin/vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
