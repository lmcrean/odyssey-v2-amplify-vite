import { test, expect } from '@playwright/test';
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

// Setup for all tests
test.beforeEach(async ({ page }) => {
  // Enable console logging for debugging
  page.on('console', msg => console.log(msg.text()));
  
  try {
    // Try ports 5173 and 5174
    const ports = [5173, 5174];
    let connected = false;
    
    for (const port of ports) {
      try {
        console.log(`Attempting to connect to port ${port}...`);
        await page.goto(`http://localhost:${port}/`, { timeout: 5000, waitUntil: 'networkidle' });
        connected = true;
        console.log(`Successfully connected to port ${port}`);
        break;
      } catch (error) {
        console.log(`Failed to connect to port ${port}:`, error.message);
      }
    }

    if (!connected) {
      throw new Error('Could not connect to development server on any port');
    }
    
    console.log('Waiting for Amplify UI to initialize...');
    await page.waitForSelector('[data-amplify-authenticator]', { timeout: 30000 });

    // Wait for any loading states to settle
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    console.log('Filling in login credentials...');
    const emailInput = page.getByPlaceholder(/enter your email/i);
    const passwordInput = page.getByPlaceholder(/enter your password/i);
    
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
    await emailInput.fill(process.env.TEST_USER_EMAIL || '');
    await passwordInput.fill(process.env.TEST_USER_PASSWORD || '');
    
    console.log('Clicking sign in button...');
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await signInButton.click();

    console.log('Waiting for authenticated view...');
    await expect(page.getByText(/Hello, authenticated user!/i)).toBeVisible({ timeout: 30000 });
    console.log('Successfully logged in!');

    // Wait for any post-login loading states to settle
    await page.waitForLoadState('networkidle');
  } catch (error) {
    console.error('Error in beforeEach:', error);
    // Take a screenshot if authentication fails
    try {
      await page.screenshot({ path: 'test-results/auth-failed.png' });
      // Log the page content for debugging
      const content = await page.content();
      console.log('Page content at failure:', content);
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError);
    }
    throw error;
  }
});

test('deletes account and redirects to login', async ({ page }) => {
  try {
    console.log('Clicking delete account button...');
    await page.getByRole('button', { name: /delete account/i }).click();

    console.log('Clicking confirm button...');
    await page.getByRole('button', { name: /confirm/i }).click();

    // Wait for the "deleting account" toast
    console.log('Waiting for "deleting account" toast...');
    const loadingToast = page.getByText(/deleting account/i);
    await expect(loadingToast).toBeVisible({ timeout: 5000 });
    
    // Wait for redirect to login page
    console.log('Waiting for redirect to login page...');
    await page.waitForSelector('[data-amplify-authenticator]', { timeout: 30000 });
    await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible({ timeout: 30000 });

    // Try to log in with the deleted user to verify it's actually deleted
    console.log('Verifying user is deleted by attempting to log in...');
    await page.getByPlaceholder(/enter your email/i).fill(process.env.TEST_USER_EMAIL || '');
    await page.getByPlaceholder(/enter your password/i).fill(process.env.TEST_USER_PASSWORD || '');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for error message
    console.log('Waiting for "Incorrect username or password" error...');
    await expect(page.getByText(/incorrect username or password/i)).toBeVisible({ timeout: 10000 });

    console.log('Delete account test completed successfully');
  } catch (error) {
    console.error('Error in delete account test:', error);
    // Take a screenshot if the test fails
    try {
      await page.screenshot({ path: 'test-results/delete-failed.png' });
      // Log the page content for debugging
      const content = await page.content();
      console.log('Page content at failure:', content);
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError);
    }
    throw error;
  }
});
