import { test, expect } from '@playwright/test';
import { deleteTestAccount } from '../../../utils/auth/backend/delete-test-account';
import { createAndSignInUser } from '../../../utils/auth/create-and-sign-in-user';

test.describe('Change Password Flow', () => {
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
          }, { timeout: 5000 });
        } catch (error) {
          console.log('No previous toasts found or timed out waiting for them to disappear');
        }
        
        // Open change password modal
        const changePasswordButton = page.getByTestId('open-change-password-modal');
        await expect(changePasswordButton).toBeVisible({ timeout: 10000 });
        await changePasswordButton.click();
        console.log('Clicked change password button');

        // Fill in the form
        const currentPasswordInput = page.getByLabel(/current password/i);
        await expect(currentPasswordInput).toBeVisible({ timeout: 5000 });
        await currentPasswordInput.fill(currentPassword);
        
        const newPasswordInput = page.getByLabel(/^new password$/i);
        await expect(newPasswordInput).toBeVisible({ timeout: 5000 });
        await newPasswordInput.fill(newPassword);
        
        const confirmPasswordInput = page.getByLabel(/confirm.*password/i);
        await expect(confirmPasswordInput).toBeVisible({ timeout: 5000 });
        await confirmPasswordInput.fill(newPassword);
        console.log('Filled password form');

        // Submit and wait for success
        const submitButton = page.getByTestId('submit-change-password');
        await submitButton.click();
        console.log('Submitted password change');

        // Wait for success message
        await expect(page.getByText(/password changed successfully/i))
          .toBeVisible({ timeout: 10000 });
        console.log('Saw success message');

        // Wait for modal to close
        await expect(currentPasswordInput).not.toBeVisible({ timeout: 5000 });
        console.log('Modal closed');

        // Update current password for next iteration
        currentPassword = newPassword;
        console.log(`Completed password change attempt ${i}`);

        // Take success screenshot
        await page.screenshot({ path: `password-change-success-${i}.png` });

        // Wait between attempts
        await page.waitForTimeout(5000);

      } catch (error) {
        console.error(`Failed to change password in attempt ${i}:`, error);
        // Take error screenshot
        await page.screenshot({ path: `password-change-error-${i}.png` });
        throw error;
      }
    }

    // 4. Verify we can sign in with the final password
    console.log('\nVerifying final password works...');
    
    // Sign out
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page.getByRole('tab', { name: /sign in/i }))
      .toBeVisible({ timeout: 5000 });
    console.log('Signed out successfully');

    // Sign in with new password
    await page.getByLabel(/email/i).fill(testUserEmail);
    await page.getByLabel(/^password$/i).fill(currentPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify successful sign in
    await expect(page.getByText(/hello/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /sign out/i }))
      .toBeVisible({ timeout: 5000 });
    console.log('Successfully signed in with final password');
  });
}); 