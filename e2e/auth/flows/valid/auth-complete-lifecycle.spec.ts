import { test, expect } from '@playwright/test';
import { verifyTestUser } from '../../../utils/auth/backend/verify-test-user';
import { deleteTestAccount } from '../../../utils/auth/backend/delete-test-account';
import { createAndSignInUser } from '../../../utils/auth/create-and-sign-in-user';
import { runPasswordChangeStressTest } from '../../../utils/auth/form/change-password-stress-test';
import { deleteAccount } from '../../../utils/auth/form/delete-account';

// Increase test timeout to 2 minutes since we're doing multiple operations
test.describe('Complete Auth Lifecycle', () => {
  let testUserEmail: string;
  let testUserPassword: string;

  // Move cleanup to afterAll instead of afterEach
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

  test('completes full auth lifecycle including account changes and deletion', async ({ page }) => {
    // Set test timeout to 2 minutes
    test.setTimeout(120000);
    
    // Create and sign in user using utility
    const { email, password } = await createAndSignInUser(page);
    testUserEmail = email;
    testUserPassword = password;

    // Wait for initial auth state to settle
    await page.waitForLoadState('networkidle');

    // 6. Change display name three times
    for (let i = 1; i <= 3; i++) {
      console.log(`Attempting display name change ${i}`);
      try {
        // Wait for network idle before starting
        await page.waitForLoadState('networkidle');
        
        // Wait for any previous toasts to disappear
        try {
          await page.waitForFunction(() => {
            const toasts = document.querySelectorAll('[role="alert"]');
            return toasts.length === 0;
          }, { timeout: 5000 });
        } catch (error) {
          console.log('No previous toasts found or timed out waiting for them to disappear');
        }

        const changeDisplayNameButton = page.getByTestId('open-change-display-name-modal');
        await expect(changeDisplayNameButton).toBeVisible({ timeout: 10000 });
        console.log('Change display name button is visible');
        await changeDisplayNameButton.click();
        console.log('Clicked change display name button');

        const newName = `TestUser${i}${Date.now()}`;
        console.log(`Setting new display name to: ${newName}`);
        
        const nameInput = page.getByLabel(/new display name/i);
        await expect(nameInput).toBeVisible({ timeout: 10000 });
        console.log('Display name input is visible');
        await nameInput.fill(newName);
        console.log('Filled display name input');

        const submitButton = page.getByTestId('submit-change-display-name');
        await expect(submitButton).toBeVisible({ timeout: 10000 });
        console.log('Submit button is visible');
        await submitButton.click();
        console.log('Clicked submit button');

        // Wait for loading toast
        await expect(page.getByText(/changing display name/i)).toBeVisible({ timeout: 10000 });
        console.log('Saw loading message');

        // Wait for success toast
        await expect(page.getByText(/display name changed successfully/i)).toBeVisible({ timeout: 10000 });
        console.log(`Successfully changed display name to: ${newName}`);

        // Wait for network idle after success
        await page.waitForLoadState('networkidle');

        // Take a screenshot after success
        await page.screenshot({ path: `display-name-change-success-${i}.png` });

        // Wait for the success toast to disappear and network to be idle
        await page.waitForTimeout(3500);
        await page.waitForLoadState('networkidle');
      } catch (error) {
        console.error(`Failed to change display name in attempt ${i}:`, error);
        // Take a screenshot on error
        await page.screenshot({ path: `display-name-change-error-${i}.png` });
        // Get any error messages on the page
        const errorText = await page.evaluate(() => {
          const errorElements = document.querySelectorAll('[role="alert"]');
          return Array.from(errorElements).map(el => el.textContent).join(', ');
        });
        console.error('Error messages on page:', errorText);
        throw error;
      }
    }

    // Wait for network idle before starting password changes
    await page.waitForLoadState('networkidle');

    // 7. Change password three times using the stress test utility
    const { finalPassword } = await runPasswordChangeStressTest({
      page,
      initialPassword: testUserPassword,
      userEmail: testUserEmail,
      iterations: 3,
      takeScreenshots: true,
      waitBetweenAttempts: 2000
    });
    testUserPassword = finalPassword;

    // Wait for network idle before starting account deletion
    await page.waitForLoadState('networkidle');

    // 8. Delete account through UI
    await deleteAccount({
      page,
      takeScreenshots: true
    });

    // Verify account deletion success with increased timeout
    await expect(page.getByText(/account deleted successfully/i))
      .toBeVisible({ timeout: 10000 });
    console.log('Saw deletion success message');
      
    // Verify we're back at the sign-in screen
    await expect(page.getByRole('tab', { name: /sign in/i }))
      .toBeVisible({ timeout: 10000 });
    console.log('Back at sign-in screen');
  });
});
