import { test, expect } from '@playwright/test';
import { fillSignInForm } from '../../../../utils/auth/form/fill-sign-in';
import { expectErrorToast } from '../../../../utils/toast/error';

test.describe('Invalid Sign In - Nonexistent User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Verify we're on the right page
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('shows error for non-existent user', async ({ page }) => {
    test.slow();
    await fillSignInForm(page, 'nonexistent@example.com', 'Test123!@#');
    await expectErrorToast(page, 'User does not exist', 10000);
  });
}); 