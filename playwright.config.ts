import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
const envPath = path.resolve(process.cwd(), '.env');
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
  retries: process.env.CI ? 0 : 0,
  workers: 1,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5176',
    trace: 'on',
    screenshot: 'on',
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 }
    },
    actionTimeout: 15000,
    navigationTimeout: 15000,
    viewport: { width: 1280, height: 720 },
    testIdAttribute: 'data-testid',
    // Allow JavaScript access
    bypassCSP: true,
    // Enable localStorage access
    contextOptions: {
      storageState: undefined,
    },
    // Make storage state optional
    storageState: process.env.CI ? undefined : './e2e/.auth/storage-state.json'
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
      use: {
        ...devices['Desktop Safari'],
        // Allow JavaScript access in Safari
        javaScriptEnabled: true,
      },
    },
  ],

  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
    // Add Vite-specific optimizations
    env: {
      // Disable HMR for tests to reduce overhead
      VITE_DISABLE_HMR: 'true',
      // Use production mode for tests to improve performance
      NODE_ENV: process.env.CI ? 'production' : 'development'
    }
  },
  // Add global test timeout
  timeout: 30000,
  // Increase expect timeout for Vite's initial compilation
  expect: {
    timeout: 10000
  },
}); 