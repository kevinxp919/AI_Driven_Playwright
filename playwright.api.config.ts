import { defineConfig } from '@playwright/test';

/**
 * Playwright API Configuration
 * API tests don't need browsers - only Node.js
 */
export default defineConfig({
  testDir: './tests/api',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 8 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report-api' }],
    ['line'],
  ],
  use: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
});
