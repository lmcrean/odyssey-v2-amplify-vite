import { test, expect } from '@playwright/test';
import { fillSignInForm, clickSignIn, clickSignOut } from '../../../../utils/auth/form';
import { expectSuccessToast, expectInfoToast } from '../../../../utils/toast';
import validUser from '../../../../fixtures/user/valid.json';

test.describe('Valid Sign Out Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in first
    await page.goto('/');
    await fillSignInForm(page, validUser.email, validUser.password);
    await clickSignIn(page);
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });

  test('completes sign out process', async ({ page }) => {
    await clickSignOut(page);

    // Verify sign out process
    await expectInfoToast(page, 'Signing out...');
    await expectSuccessToast(page, 'Successfully signed out');
    
    // Verify return to sign in view
    await expect(page.getByRole('tab', { name: /sign in/i })).toBeVisible();
  });
}); 