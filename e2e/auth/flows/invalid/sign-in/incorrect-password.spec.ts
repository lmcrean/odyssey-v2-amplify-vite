import { test, expect } from '@playwright/test';
import { fillSignInForm } from '../../../../utils/auth/form/fill-sign-in';
import { expectErrorToast } from '../../../../utils/toast/error';

test.describe('Invalid Sign In - Incorrect Password', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Verify we're on the right page
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('shows error for incorrect password', async ({ page }) => {
    test.slow();
    // Using a known email with wrong password
    await fillSignInForm(page, 'test@example.com', 'WrongPassword123!');
    await expectErrorToast(page, 'Incorrect username or password', 10000);
  });
}); 