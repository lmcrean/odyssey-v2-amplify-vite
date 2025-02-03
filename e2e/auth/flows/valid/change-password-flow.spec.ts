import { test, expect } from '@playwright/test';
import { deleteTestAccount } from '../../../utils/auth/backend/delete-test-account';
import { createAndSignInUser } from '../../../utils/auth/create-and-sign-in-user';
import { runPasswordChangeStressTest } from '../../../utils/auth/form/change-password-stress-test';

// Configure longer timeout for this test file
test.describe('Change Password Flow', () => {
  // Set timeout to 90 seconds for this specific test
  test.setTimeout(90000);
  
  let testUserEmail: string;

  test.afterAll(async () => {
    try {
      // Clean up test account if email exists
      if (testUserEmail) {
        await deleteTestAccount(testUserEmail);
        console.log('Successfully cleaned up test account:', testUserEmail);
      }
    } catch (error) {
      console.log('Cleanup error (can be ignored):', error);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to home and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('Initial page load complete');
  });

  test('changes password three times successfully', async ({ page }) => {
    // Create and sign in user using utility
    const { email, password } = await createAndSignInUser(page);
    testUserEmail = email;

    // Run password change stress test
    await runPasswordChangeStressTest({
      page,
      initialPassword: password,
      iterations: 3,
      takeScreenshots: true,
      waitBetweenAttempts: 2000,
      userEmail: testUserEmail
    });
  });
}); 