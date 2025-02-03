import { test, expect } from '@playwright/test';
import { verifyTestUser } from '../../../utils/auth/backend/verify-test-user';
import { deleteTestAccount } from '../../../utils/auth/backend/delete-test-account';
import { createAndSignInUser } from '../../../utils/auth/create-and-sign-in-user';

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
    // Create and sign in user using utility
    const { email, password } = await createAndSignInUser(page);
    testUserEmail = email;
    testUserPassword = password;

    // 6. Change display name three times
    for (let i = 1; i <= 3; i++) {
      console.log(`Attempting display name change ${i}`);
      try {
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

        // Take a screenshot after success
        await page.screenshot({ path: `display-name-change-success-${i}.png` });

        // Wait for the success toast to disappear
        await page.waitForTimeout(3500); // Wait a bit longer than the autoClose time
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

    // 7. Change password three times
    let currentPassword = password;
    for (let i = 1; i <= 3; i++) {
      console.log(`Attempting password change ${i}`);
      try {
        const newPassword = `NewPass${i}123!@#`;
        
        // Open change password modal
        const changePasswordButton = page.getByTestId('open-change-password-modal');
        await expect(changePasswordButton).toBeVisible();
        await changePasswordButton.click();
        console.log('Clicked change password button');

        // Fill in the form
        const currentPasswordInput = page.getByLabel(/current password/i);
        await currentPasswordInput.fill(currentPassword);
        const newPasswordInput = page.getByLabel(/^new password$/i);
        await newPasswordInput.fill(newPassword);
        const confirmPasswordInput = page.getByLabel(/confirm.*password/i);
        await confirmPasswordInput.fill(newPassword);
        console.log('Filled password form');

        // Submit and wait for any response
        const submitButton = page.getByTestId('submit-change-password');
        await submitButton.click();
        console.log('Submitted password change');

        // Simple wait for UI to settle
        await page.waitForTimeout(2000);

        // Update current password for next iteration
        currentPassword = newPassword;
        console.log(`Completed password change attempt ${i}`);

      } catch (error) {
        console.error(`Failed to change password in attempt ${i}:`, error);
        throw error;
      }
    }

    // 8. Delete account through UI
    console.log('Starting account deletion process...');
    
    // Wait for and verify delete button is visible
    const deleteButton = page.getByTestId('open-delete-account-modal');
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    console.log('Delete button is visible');
    
    // Ensure the button is enabled
    await expect(deleteButton).toBeEnabled({ timeout: 5000 });
    console.log('Delete button is enabled');
    
    // Click with retry logic
    try {
      await deleteButton.click({ timeout: 5000 });
      console.log('Successfully clicked delete button');
    } catch (error) {
      console.error('Failed to click delete button:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: 'delete-button-error.png' });
      throw error;
    }

    // Wait for modal with increased timeout
    await expect(page.getByTestId('confirm-delete-account'))
      .toBeVisible({ timeout: 10000 });
    console.log('Delete confirmation modal is visible');
    
    // Click confirm with retry logic
    const confirmButton = page.getByTestId('confirm-delete-account');
    try {
      await confirmButton.click({ timeout: 5000 });
      console.log('Successfully clicked confirm button');
    } catch (error) {
      console.error('Failed to click confirm button:', error);
      // Take a screenshot for debugging
      await page.screenshot({ path: 'confirm-button-error.png' });
      throw error;
    }
    
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
