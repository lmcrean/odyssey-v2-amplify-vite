import { test, expect } from '@playwright/test';
import { fillSignInForm, clickSignIn } from '../../../../utils/auth/form';
import { expectSuccessToast } from '../../../../utils/toast';
import validUser from '../../../../fixtures/user/valid.json';

test.describe('Valid Sign In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes sign in process', async ({ page }) => {
    await fillSignInForm(page, validUser.email, validUser.password);
    await clickSignIn(page);

    // Verify successful sign in
    await expectSuccessToast(page, 'Successfully signed in');
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });
}); 