import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/media-lab',
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'out/media-lab-report' }],
  ],
  outputDir: 'out/media-lab-results',
  use: {
    baseURL: 'http://127.0.0.1:4175',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run preview:media-lab -- --strictPort',
    url: 'http://127.0.0.1:4175',
    reuseExistingServer: false,
  },
});
