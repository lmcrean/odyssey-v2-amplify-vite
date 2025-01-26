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
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD,
  TEST_USER_PASSWORD_LENGTH: process.env.TEST_USER_PASSWORD?.length,
  TEST_USER_PASSWORD_CHARS: process.env.TEST_USER_PASSWORD?.split('').map(c => ({ char: c, code: c.charCodeAt(0) }))
});

test('shows delete account button after login', async ({ page }) => {
  // Enable console logging for debugging
  page.on('console', msg => console.log(msg.text()));
  
  // Log network errors
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

    console.log('Filling in login credentials...');
    const emailInput = page.getByPlaceholder(/enter your email/i);
    const passwordInput = page.getByPlaceholder(/enter your password/i);
    
    await emailInput.waitFor({ state: 'visible', timeout: 10000 });
    await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
    
    const email = process.env.TEST_USER_EMAIL || '';
    const password = process.env.TEST_USER_PASSWORD || '';
    console.log('Using credentials:', {
      email,
      passwordLength: password.length,
      passwordFirstChar: password.charAt(0),
      passwordLastChar: password.charAt(password.length - 1),
      passwordCharCodes: password.split('').map(c => ({ char: c, code: c.charCodeAt(0) }))
    });
    
    await emailInput.fill(email);
    await passwordInput.fill(password);
    
    console.log('Clicking sign in button...');
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.waitFor({ state: 'visible', timeout: 10000 });
    await signInButton.click();

    // Wait for any post-login loading states to settle
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Take a screenshot before checking for the button
    console.log('Taking screenshot of current state...');
    await page.screenshot({ path: 'test-results/pre-button-check.png' });

    // Check for the delete account button
    console.log('Checking for delete account button...');
    const deleteButton = page.getByRole('button', { name: /delete account/i });
    await expect(deleteButton).toBeVisible({ timeout: 30000 });
    
    // Take a success screenshot
    console.log('Taking screenshot of success state...');
    await page.screenshot({ path: 'test-results/button-visible.png' });
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
    
    // Take error screenshot
    try {
      await page.screenshot({ path: 'test-results/button-test-failed.png' });
      const content = await page.content();
      console.log('Page content at failure:', content);
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError);
    }
    
    throw error;
  }
}); 