// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test',
  timeout: 300000, // 5 minutes to avoid timeouts
  expect: {
    timeout: 5000 // Reduced expect timeout to avoid long waits
  },
  fullyParallel: true,
  retries: 0, // Disable retries to prevent multiple runs
  workers: undefined,
  reporter: 'html',
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});