import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'e2e-tests',
      testDir: './e2e/tests',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'visual-regression',
      testDir: './e2e/visual',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'accessibility',
      testDir: './e2e/accessibility',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'performance',
      testDir: './e2e/performance',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'cross-browser',
      testDir: './e2e/tests',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile',
      testDir: './e2e/tests',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
