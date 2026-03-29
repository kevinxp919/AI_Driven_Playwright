import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright UI Configuration
 * Runs only UI E2E tests with browser automation
 */
export default defineConfig({
  testDir: './tests',
  testIgnore: ['**/tests/api/**'],
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  failureReason: true,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['line'],
    ['github']
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
