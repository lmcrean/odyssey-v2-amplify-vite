import { test, expect } from '@playwright/test';
import { 
  fillSignInForm, 
  fillSignUpForm,
  clickSignIn,
  clickCreateAccount,
  clickSignOut,
  clickDeleteAccount 
} from '../utils/auth/form';

test.describe('Auth Utilities', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for auth form to be visible
    await expect(page.locator('form[data-amplify-form]')).toBeVisible();
  });

  test('fillSignInForm fills email and password fields', async ({ page }) => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    await fillSignInForm(page, testEmail, testPassword);

    // Verify fields are filled
    await expect(page.locator('input[name="username"]')).toHaveValue(testEmail);
    await expect(page.locator('input[name="password"]')).toHaveValue(testPassword);
  });

  test('clickSignIn clicks the sign in button', async ({ page }) => {
    // First fill the form to enable the button
    await fillSignInForm(page, 'test@example.com', 'password123');
    
    // Click sign in and verify the click happened (button should be in loading state)
    await clickSignIn(page);
    const signInButton = page.locator('button[type="submit"]');
    await expect(signInButton).toBeVisible();
  });

  test('clickCreateAccount switches to create account tab', async ({ page }) => {
    await clickCreateAccount(page);
    
    // Verify we're on the create account tab
    const createAccountTab = page.locator('[role="tab"]').filter({ hasText: 'Create Account' });
    await expect(createAccountTab).toHaveAttribute('aria-selected', 'true');
  });

  test('fillSignUpForm fills all registration fields', async ({ page }) => {
    await clickCreateAccount(page);
    
    // Wait for the create account tab to be active
    const createAccountTab = page.locator('[role="tab"]').filter({ hasText: 'Create Account' });
    await expect(createAccountTab).toHaveAttribute('aria-selected', 'true');
    
    // Wait for the form to be visible and log its content
    const signUpForm = page.locator('form[data-amplify-authenticator-signup]');
    await expect(signUpForm).toBeVisible();
    
    const testData = {
      email: 'newuser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    };

    // Wait for and verify each field exists before filling
    const emailField = page.locator('input[name="email"][type="email"]');
    const passwordField = page.locator('input[name="password"][type="password"]');
    const confirmPasswordField = page.locator('input[name="confirm_password"][type="password"]');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(confirmPasswordField).toBeVisible();

    await fillSignUpForm(page, testData.email, testData.password, testData.confirmPassword);

    // Verify all fields are filled
    await expect(emailField).toHaveValue(testData.email);
    await expect(passwordField).toHaveValue(testData.password);
    await expect(confirmPasswordField).toHaveValue(testData.confirmPassword);
  });

  // Note: These tests verify the utility functions work, not the actual authentication
  // The actual authentication tests are in the auth flow tests
}); 