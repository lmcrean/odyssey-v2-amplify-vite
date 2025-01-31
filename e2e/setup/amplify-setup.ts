import { test as base, expect } from '@playwright/test';
import { Amplify } from 'aws-amplify';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configure Amplify with test environment settings
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_USER_POOL_ID!,
      userPoolClientId: process.env.VITE_USER_POOL_CLIENT_ID!
    }
  }
});

// Add type declaration for window.Amplify
declare global {
  interface Window {
    Amplify: typeof Amplify;
  }
}

// Create a test fixture that includes Amplify configuration
export const test = base.extend({
  page: async ({ page }, use) => {
    // Add Amplify configuration to the page
    await page.addInitScript(() => {
      window.Amplify = Amplify;
    });
    await use(page);
  },
});

export { expect }; 