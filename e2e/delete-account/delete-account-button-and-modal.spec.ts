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
  page.on('response', response => {
    if (response.status() === 400) {
      console.log('400 Error Response:', {
        url: response.url(),
        status: response.status(),
      });
      response.text().then(text => {
        console.log('Response body:', text);
      }).catch(err => {
        console.log('Error getting response text:', err);
      });
    }
  });
  
  try {
    console.log('Navigating to the page...');
    await page.goto('/', { waitUntil: 'networkidle' });
    
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

    // Wait for any post-login loading states to settle
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Wait for either the delete account button or an error message
    console.log('Waiting for authenticated view or error message...');
    try {
      const deleteButton = page.getByRole('button', { name: /delete account/i });
      await expect(deleteButton).toBeVisible({ timeout: 60000 });
      console.log('Successfully logged in!');
    } catch (error) {
      // Take a screenshot and log the page content before checking error messages
      console.log('Login failed, capturing error state...');
      await page.screenshot({ path: 'test-results/login-error.png' });
      const content = await page.content();
      console.log('Page content at login failure:', content);

      // Check for error messages
      const errorMessages = [
        /incorrect username or password/i,
        /user does not exist/i,
        /user is disabled/i,
        /password attempts exceeded/i,
        /invalid username or password/i,
        /user not found/i
      ];

      for (const pattern of errorMessages) {
        const errorText = page.getByText(pattern);
        const isVisible = await errorText.isVisible();
        if (isVisible) {
          console.log('Found error message:', pattern);
          throw new Error(`Login failed: ${pattern}`);
        }
      }

      throw error;
    }

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

test('shows delete account button after login', async ({ page }) => {
  try {
    console.log('Taking screenshot of authenticated view...');
    await page.screenshot({ path: 'test-results/authenticated-view.png' });

    console.log('Checking for delete account button...');
    const deleteButton = page.getByRole('button', { name: /delete account/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    console.log('Delete account button is visible');
  } catch (error) {
    console.error('Error in delete button test:', error);
    throw error;
  }
});

test('shows confirmation modal when delete button is clicked', async ({ page }) => {
  try {
    console.log('Clicking delete account button...');
    await page.getByRole('button', { name: /delete account/i }).click();

    console.log('Taking screenshot of delete modal...');
    await page.screenshot({ path: 'test-results/delete-modal.png' });

    console.log('Verifying modal content...');
    await expect(page.getByText(/are you sure/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /confirm/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible({ timeout: 5000 });
    console.log('Modal content verified');
  } catch (error) {
    console.error('Error in confirmation modal test:', error);
    throw error;
  }
});

test('cancels deletion when cancel is clicked', async ({ page }) => {
  try {
    console.log('Clicking delete account button...');
    await page.getByRole('button', { name: /delete account/i }).click();

    console.log('Clicking cancel button...');
    await page.getByRole('button', { name: /cancel/i }).click();

    console.log('Taking screenshot after cancel...');
    await page.screenshot({ path: 'test-results/after-cancel.png' });

    console.log('Verifying modal is closed...');
    await expect(page.getByText(/are you sure/i)).not.toBeVisible({ timeout: 5000 });
    console.log('Cancel operation verified');
  } catch (error) {
    console.error('Error in cancel deletion test:', error);
    throw error;
  }
});
