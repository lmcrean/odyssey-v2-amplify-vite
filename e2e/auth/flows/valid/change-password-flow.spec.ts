import { test, expect } from '@playwright/test';
import { deleteTestAccount } from '../../../utils/auth/backend/delete-test-account';
import { createAndSignInUser } from '../../../utils/auth/create-and-sign-in-user';

// Configure longer timeout for this test file
test.describe('Change Password Flow', () => {
  // Set timeout to 90 seconds for this specific test
  test.setTimeout(90000);
  
  let testUserEmail: string;
  let currentPassword: string;

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
    currentPassword = password;

    // 3. Change password three times
    for (let i = 1; i <= 3; i++) {
      console.log(`\nAttempting password change ${i}`);
      try {
        const newPassword = `NewPass${i}123!@#`;
        
        // Wait for any previous toasts to disappear
        try {
          await page.waitForFunction(() => {
            const toasts = document.querySelectorAll('[role="alert"]');
            return toasts.length === 0;
          }, { timeout: 10000 });
        } catch (error) {
          console.log('No previous toasts found or timed out waiting for them to disappear');
        }
        
        // Open change password modal with retry logic
        const changePasswordButton = page.getByTestId('open-change-password-modal');
        await expect(changePasswordButton).toBeVisible({ timeout: 15000 });
        await changePasswordButton.click();
        console.log('Clicked change password button');

        // Fill in the form with explicit waits
        const currentPasswordInput = page.getByLabel(/current password/i);
        await expect(currentPasswordInput).toBeVisible({ timeout: 10000 });
        await currentPasswordInput.fill(currentPassword);
        
        const newPasswordInput = page.getByLabel(/^new password$/i);
        await expect(newPasswordInput).toBeVisible({ timeout: 10000 });
        await newPasswordInput.fill(newPassword);
        
        const confirmPasswordInput = page.getByLabel(/confirm.*password/i);
        await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });
        await confirmPasswordInput.fill(newPassword);
        console.log('Filled password form');

        // Submit and wait for success with increased timeout
        const submitButton = page.getByTestId('submit-change-password');
        await submitButton.click();
        console.log('Submitted password change');

        // Wait for success message with increased timeout
        await expect(page.getByText(/password changed successfully/i))
          .toBeVisible({ timeout: 15000 });
        console.log('Saw success message');

        // Wait for modal to close with increased timeout
        await expect(currentPasswordInput).not.toBeVisible({ timeout: 10000 });
        console.log('Modal closed');

        // Update current password for next iteration
        currentPassword = newPassword;
        console.log(`Completed password change attempt ${i}`);

        // Take success screenshot
        await page.screenshot({ path: `password-change-success-${i}.png` });

        // Reduced wait between attempts
        await page.waitForTimeout(2000);

      } catch (error) {
        console.error(`Failed to change password in attempt ${i}:`, error);
        // Take error screenshot if page is still available
        try {
          await page.screenshot({ path: `password-change-error-${i}.png` });
        } catch (screenshotError) {
          console.error('Could not take error screenshot:', screenshotError);
        }
        throw error;
      }
    }

    // 4. Verify we can sign in with the final password
    console.log('\nVerifying final password works...');
    
    // Sign out with explicit waits
    const signOutButton = page.getByRole('button', { name: /sign out/i });
    await expect(signOutButton).toBeVisible({ timeout: 10000 });
    await signOutButton.click();
    
    await expect(page.getByRole('tab', { name: /sign in/i }))
      .toBeVisible({ timeout: 10000 });
    console.log('Signed out successfully');

    // Sign in with new password
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    const signInButton = page.getByRole('button', { name: /sign in/i });

    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill(testUserEmail);
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await passwordInput.fill(currentPassword);
    await signInButton.click();

    // Handle account recovery setup - click Skip
    await page.getByText(/account recovery requires verified contact information/i)
      .waitFor({ timeout: 5000 });
    await page.getByRole('button', { name: /skip/i }).click();

    // Verify Auth view using the same pattern as create-and-sign-in-user.ts
    await page.getByText(/hello/i).waitFor({ timeout: 10000 });
    await page.getByRole('button', { name: /sign out/i })
      .waitFor({ timeout: 5000 });
    console.log('Successfully signed in with final password');
  });
}); 