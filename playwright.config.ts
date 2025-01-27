import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test
const envPath = path.resolve(process.cwd(), '.env.test');
console.log('Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

// Log environment variables (without sensitive values)
console.log('Environment variables loaded:', {
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD ? '[REDACTED]' : undefined,
});

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 15000,
    viewport: { width: 1280, height: 720 },
    testIdAttribute: 'data-testid',
  },

  projects: [
    // IMPORTANT: WE ARE NOT USING CHROME OR FIREFOX, ONLY SAFARI.
    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },
    // // {
    // //   name: 'firefox',
    // //   use: { ...devices['Desktop Firefox'] },
    // // },
    {
      name: 'safari',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 