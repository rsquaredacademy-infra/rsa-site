import { defineConfig } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT ?? 4321);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    browserName: 'chromium',
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 },
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'phone',
      use: {
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 3,
      },
    },
  ],
  webServer: {
    command: `npm run build && npx astro preview --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    // The e2e build ships Cloudflare's dummy Turnstile keys; production builds never do.
    env: { PUBLIC_TURNSTILE_TEST: '1' },
    reuseExistingServer: !process.env.CI,
    timeout: 180 * 1000,
  },
});
