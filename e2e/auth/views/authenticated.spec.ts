import { test, expect } from '@playwright/test';
import { fillSignInForm, clickSignIn, clickSignOut, clickDeleteAccount } from '../../utils/auth/form';

test.describe('Authenticated View', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home and sign in
    await page.goto('/');
    await fillSignInForm(page, process.env.TEST_USER_EMAIL!, process.env.TEST_USER_PASSWORD!);
    await clickSignIn(page);
    
    // Wait for authenticated view to load
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('renders authenticated view elements', async ({ page }) => {
    // Verify welcome message
    await expect(page.getByText(/welcome/i)).toBeVisible();
    
    // Verify action buttons
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete account/i })).toBeVisible();
  });

  test('shows delete account confirmation modal', async ({ page }) => {
    // Click delete account button
    await clickDeleteAccount(page);
    
    // Verify modal content
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/are you sure/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
    
    // Verify modal can be closed
    await page.getByRole('button', { name: /cancel/i }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
}); 