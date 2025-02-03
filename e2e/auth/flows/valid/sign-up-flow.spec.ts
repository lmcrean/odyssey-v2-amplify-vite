import { test, expect } from '@playwright/test';
import { deleteTestAccount } from '../../../utils/auth/backend/delete-test-account';
import { createAndSignInUser } from '../../../utils/auth/create-and-sign-in-user';

test.describe('Valid Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('completes full sign up flow', async ({ page }) => {
    // Create and sign in user using utility
    const { email } = await createAndSignInUser(page);

    // Delete test user using backend command
    await deleteTestAccount(email);
  });
});
