import { test, expect } from '@playwright/test';

test.describe('Unauthenticated View', () => {
  test.beforeEach(async ({ page }) => {
    // Use baseURL from config
    await page.goto('/');
    
    // Wait for server to be ready with retry logic
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        break;
      } catch (error) {
        retries++;
        if (retries === maxRetries) {
          throw error;
        }
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  });

  test('renders sign-in form elements', async ({ page }) => {
    // First verify the page has loaded something
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Now look for the form
    const form = page.locator('form[data-amplify-form][data-amplify-authenticator-signin]');
    await expect(form).toBeVisible();
    
    // Check for sign in tab
    const signInTab = page.locator('[role="tab"]').filter({ hasText: 'Sign In' });
    await expect(signInTab).toBeVisible();
    await expect(signInTab).toHaveAttribute('aria-selected', 'true');
    
    // Check for create account tab
    const createAccountTab = page.locator('[role="tab"]').filter({ hasText: 'Create Account' });
    await expect(createAccountTab).toBeVisible();
    await expect(createAccountTab).toHaveAttribute('aria-selected', 'false');
    
    // Check for username/email input
    const usernameInput = page.locator('input[name="username"]');
    await expect(usernameInput).toBeVisible();
    await expect(usernameInput).toHaveAttribute('type', 'email');
    
    // Check for password input
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check for sign in button
    const signInButton = page.locator('button[type="submit"]');
    await expect(signInButton).toBeVisible();
    await expect(signInButton).toHaveText(/Sign in/i);
  });

  test('allows tab navigation', async ({ page }) => {
    // Click create account tab
    const createAccountTab = page.locator('[role="tab"]').filter({ hasText: 'Create Account' });
    await createAccountTab.click();
    await expect(createAccountTab).toHaveAttribute('aria-selected', 'true');
    
    const signInTab = page.locator('[role="tab"]').filter({ hasText: 'Sign In' });
    await expect(signInTab).toHaveAttribute('aria-selected', 'false');
    
    // Click sign in tab
    await signInTab.click();
    await expect(signInTab).toHaveAttribute('aria-selected', 'true');
    await expect(createAccountTab).toHaveAttribute('aria-selected', 'false');
  });

  test('accepts form input', async ({ page }) => {
    // Get username and password fields
    const username = page.locator('input[name="username"]');
    const password = page.locator('input[name="password"]');
    
    // Type in username
    await username.fill('test@example.com');
    await expect(username).toHaveValue('test@example.com');
    
    // Type in password
    await password.fill('password123');
    await expect(password).toHaveValue('password123');
  });
}); 