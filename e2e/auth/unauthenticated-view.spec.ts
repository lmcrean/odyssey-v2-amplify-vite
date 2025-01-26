import { test, expect } from '@playwright/test';

test.describe('Unauthenticated View', () => {
  test.beforeEach(async ({ page }) => {
    // Use the BASE_URL from environment or default to localhost
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173');
    // Add debug step
    await page.waitForTimeout(2000); // Give the page time to load
  });

  test('renders sign-in form elements', async ({ page }) => {
    // Check for sign in tab
    const signInTab = page.getByRole('tab', { name: /sign in/i });
    await expect(signInTab).toBeVisible();
    await expect(signInTab).toHaveAttribute('aria-selected', 'true');
    
    // Check for create account tab
    const createAccountTab = page.getByRole('tab', { name: /create account/i });
    await expect(createAccountTab).toBeVisible();
    await expect(createAccountTab).toHaveAttribute('aria-selected', 'false');
    
    // Check for email input
    const emailInput = page.locator('input[name="username"][type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'Enter your Email');
    
    // Check for password input
    const passwordInput = page.locator('input[name="password"][type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute('placeholder', 'Enter your Password');
    
    // Check for sign in button
    const signInButton = page.getByRole('button', { name: /sign in/i }).filter({ hasText: /^Sign in$/ });
    await expect(signInButton).toBeVisible();
  });

  test('allows tab navigation', async ({ page }) => {
    // Click create account tab
    await page.getByRole('tab', { name: /create account/i }).click();
    await expect(page.getByRole('tab', { name: /create account/i })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'false');
    
    // Click sign in tab
    await page.getByRole('tab', { name: /sign in/i }).click();
    await expect(page.getByRole('tab', { name: /sign in/i })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tab', { name: /create account/i })).toHaveAttribute('aria-selected', 'false');
  });

  test('accepts form input', async ({ page }) => {
    // Get email and password fields
    const email = page.locator('input[name="username"][type="email"]');
    const password = page.locator('input[name="password"][type="password"]');
    
    // Type in email
    await email.fill('test@example.com');
    await expect(email).toHaveValue('test@example.com');
    
    // Type in password
    await password.fill('password123');
    await expect(password).toHaveValue('password123');
  });
}); 