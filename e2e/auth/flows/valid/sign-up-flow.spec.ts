import { test, expect } from '@playwright/test';
import { fillSignUpForm, clickCreateAccount } from '../../../../utils/auth/form';
import { expectSuccessToast } from '../../../../utils/toast';
import validUser from '../../../../fixtures/user/valid.json';

test.describe('Valid Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: /create account/i }).click();
  });

  test('completes sign up process', async ({ page }) => {
    await fillSignUpForm(page, validUser.email, validUser.password, validUser.confirmPassword);
    await clickCreateAccount(page);

    // Verify successful sign up
    await expectSuccessToast(page, 'Account created successfully');
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
  });
}); 