import { test, expect } from '@playwright/test';
import { AUTH_VIEW_TEST_USER } from '../../../../src/__tests__/backend/auth/fixtures/authenticated-view-user.test';
import { fillSignUpForm, clickCreateAccount } from '../../../utils/auth/form';
import { expectSuccessToast } from '../../../utils/toast';

test.describe('Valid Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Click the Create Account tab with retry
    await page.getByRole('tab', { name: /create account/i }).click({
      timeout: 5000
    });
    
    // Wait for the form
    await page.waitForSelector('[data-testid="authenticator-form"]', {
      timeout: 10000
    });

    // Start listening to console logs
    page.on('console', msg => {
      console.log(`Browser console: ${msg.type()}: ${msg.text()}`);
    });
  });

  test('successfully completes sign up flow', async ({ page }) => {
    // Generate unique email to avoid conflicts
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const password = AUTH_VIEW_TEST_USER.password;
    
    // Fill the form
    await fillSignUpForm(page, uniqueEmail, password, password);
    await clickCreateAccount(page);

    // Wait for success toast
    await expectSuccessToast(page, 'Account created successfully');

    // Verify authenticated state
    await expect(page.getByText(/hello/i)).toBeVisible({ timeout: 10000 });
    
    // Verify user actions available
    await expect(page.getByRole('button', { name: /sign out/i }))
      .toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /delete account/i }))
      .toBeVisible({ timeout: 5000 });

    // Clean up - delete the test account
    await page.getByRole('button', { name: /delete account/i }).click();
    await page.getByTestId('confirm-delete-account').click();
    await expectSuccessToast(page, 'Account deleted successfully');
  });

  test('shows validation errors for invalid inputs', async ({ page }) => {
    // Test invalid email format
    await page.getByLabel(/username/i).fill('invalid-email');
    await page.getByLabel(/^password$/i).fill('Test123!@#');
    await page.getByRole('button', { name: /sign up/i }).click();

    // Wait for error message with retry
    await expect(page.getByText(/invalid email format/i))
      .toBeVisible({ timeout: 5000 });

    // Clear fields before next test
    await page.getByLabel(/username/i).clear();
    await page.getByLabel(/^password$/i).clear();

    // Test weak password
    await page.getByLabel(/username/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('weak');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/password does not meet requirements/i))
      .toBeVisible({ timeout: 5000 });
  });

  test('handles existing email gracefully', async ({ page }) => {
    // Use the test user email that we know exists
    await page.getByLabel(/username/i).fill(AUTH_VIEW_TEST_USER.email);
    await page.getByLabel(/^password$/i).fill('Test123!@#');
    await page.getByRole('button', { name: /sign up/i }).click();

    await expect(page.getByText(/an account with this email already exists/i))
      .toBeVisible({ timeout: 5000 });
  });

  test('allows navigation between sign up and sign in', async ({ page }) => {
    // Add small delay between tab switches
    await page.getByRole('tab', { name: /sign in/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: /sign in/i }))
      .toBeVisible({ timeout: 5000 });

    await page.getByRole('tab', { name: /create account/i }).click();
    await page.waitForTimeout(500);
    await expect(page.getByRole('button', { name: /sign up/i }))
      .toBeVisible({ timeout: 5000 });
  });
}); 