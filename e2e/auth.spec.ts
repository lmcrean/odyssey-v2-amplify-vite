import { test, expect } from '@playwright/test';

// Setup for all tests
test.beforeEach(async ({ page }) => {
  // Enable console logging for debugging
  page.on('console', msg => console.log(msg.text()));
  // Navigate to the page before each test
  await page.goto('/');
  // Wait for Amplify UI to initialize with longer timeout
  await page.waitForSelector('[data-amplify-authenticator]', { timeout: 10000 });
});

test('shows login form on initial load', async ({ page }) => {
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/login-form.png' });
  
  // Check for Amplify UI elements using more specific selectors
  const authenticator = page.locator('[data-amplify-authenticator]');
  await expect(authenticator).toBeVisible();
  
  // Wait for form fields to be present
  await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
  await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
});

test('shows create account form', async ({ page }) => {
  // Find and click the create account button/link
  await page.getByText(/Create account/i).click();
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/create-account-form.png' });
  
  // Verify create account form fields
  await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
  await expect(page.getByPlaceholder(/enter your password/i)).toBeVisible();
  await expect(page.getByPlaceholder(/confirm your password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
});

test('shows reset password form', async ({ page }) => {
  // Wait for sign-in form to be fully loaded
  await page.waitForLoadState('networkidle');
  
  // Wait for and click the "Forgot your password?" link
  const forgotPasswordLink = page.getByText(/forgot your password/i);
  await forgotPasswordLink.waitFor({ state: 'visible', timeout: 10000 });
  await forgotPasswordLink.click();
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/reset-password-form.png' });
  
  // Verify reset password form fields
  await expect(page.getByPlaceholder(/enter your email/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /send code/i })).toBeVisible();
}); 