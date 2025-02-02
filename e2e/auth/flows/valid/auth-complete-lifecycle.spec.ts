import { test, expect } from '@playwright/test';
import { verifyTestUser } from '../../../utils/auth/backend/verify-test-user';
import { deleteTestAccount } from '../../../utils/auth/backend/delete-test-account';

test.describe('Complete Auth Lifecycle', () => {
  let testUserEmail: string;

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
    // 1. Create random user with UI - generate unique email
    testUserEmail = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    console.log('Starting test with email:', testUserEmail);

    // Click the Create Account tab
    await page.getByRole('tab', { name: /create account/i }).click();
    await page.waitForTimeout(500); // Small delay for tab switch

    // 2. Sign up with UI
    await page.getByLabel(/email/i).fill(testUserEmail);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByLabel(/confirm password/i).fill(password);
    
    // Debug: Log form values before submission
    console.log('Form values before submission:', {
      email: await page.getByLabel(/email/i).inputValue(),
      password: '***',
      confirmPassword: '***'
    });

    // Click create account and wait for response
    const createAccountButton = page.getByRole('button', { name: /create account/i });
    await Promise.all([
      page.waitForResponse(response => response.url().includes('cognito') || response.url().includes('oauth2')),
      createAccountButton.click()
    ]);

    // Wait for network requests to complete
    await page.waitForLoadState('networkidle');

    // Take a screenshot to debug
    await page.screenshot({ path: 'signup-confirmation.png' });



    // Check for error messages first
    const errorLocator = page.getByText(/error|failed|invalid/i);
    const hasError = await errorLocator.isVisible();
    if (hasError) {
      const errorText = await errorLocator.textContent();
      console.error('Found error message:', errorText);
      throw new Error(`Signup failed with error: ${errorText}`);
    }

    // Wait for confirmation screen with longer timeout
    await expect(page.getByText(/verify your email|confirm your email|confirmation code/i)).toBeVisible({ timeout: 10000 });

    // 3. Auto-verify the user using AWS Admin API
    await verifyTestUser(testUserEmail);

    // After verification, we need to reload the page to get back to the sign-in form
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 4. Sign in with UI
    await page.getByLabel(/email/i).fill(testUserEmail);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Handle account recovery setup - click Skip
    await expect(page.getByText(/account recovery requires verified contact information/i))
      .toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: /skip/i }).click();

    // 5. Verify Auth view
    await expect(page.getByText(/hello/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /sign out/i }))
      .toBeVisible({ timeout: 5000 });

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
        // Wait for any previous toasts to disappear
        try {
          await page.waitForFunction(() => {
            const toasts = document.querySelectorAll('[role="alert"]');
            return toasts.length === 0;
          }, { timeout: 5000 });
        } catch (error) {
          console.log('No previous toasts found or timed out waiting for them to disappear');
        }

        const newPassword = `NewPass${i}123!@#`;
        
        // Open change password modal
        const changePasswordButton = page.getByTestId('open-change-password-modal');
        await expect(changePasswordButton).toBeVisible({ timeout: 10000 });
        console.log('Change password button is visible');
        await changePasswordButton.click();
        console.log('Clicked change password button');
        
        // Wait for current password field to be visible and interactable
        const currentPasswordInput = page.getByLabel(/current password/i);
        await expect(currentPasswordInput).toBeVisible({ timeout: 10000 });
        await expect(currentPasswordInput).toBeEnabled({ timeout: 10000 });
        console.log('Current password field is ready');
        
        // Fill current password
        await currentPasswordInput.fill(currentPassword);
        console.log('Filled current password');
        
        // Wait for and fill new password
        const newPasswordInput = page.getByLabel(/^new password$/i);
        await expect(newPasswordInput).toBeVisible({ timeout: 10000 });
        await expect(newPasswordInput).toBeEnabled({ timeout: 10000 });
        await newPasswordInput.fill(newPassword);
        console.log('Filled new password');
        
        // Wait for and fill confirm password
        const confirmPasswordInput = page.getByLabel(/confirm new password/i);
        await expect(confirmPasswordInput).toBeVisible({ timeout: 10000 });
        await expect(confirmPasswordInput).toBeEnabled({ timeout: 10000 });
        await confirmPasswordInput.fill(newPassword);
        console.log('Filled confirm password');
        
        // Submit password change
        const submitButton = page.getByTestId('submit-change-password');
        await expect(submitButton).toBeVisible({ timeout: 10000 });
        await expect(submitButton).toBeEnabled({ timeout: 10000 });
        console.log('Submit button is ready');
        await submitButton.click();
        console.log('Clicked submit button');
        
        // Wait for success toast
        await expect(page.getByText(/password changed successfully/i))
          .toBeVisible({ timeout: 10000 });
        console.log(`Successfully changed password attempt ${i}`);

        // Take a screenshot after success
        await page.screenshot({ path: `password-change-success-${i}.png` });
        
        // Wait for modal to close and toast to disappear
        await page.waitForTimeout(3500);
        
        currentPassword = newPassword;
      } catch (error) {
        console.error(`Failed to change password in attempt ${i}:`, error);
        // Take a screenshot on error
        await page.screenshot({ path: `password-change-error-${i}.png` });
        // Get any error messages on the page
        const errorText = await page.evaluate(() => {
          const errorElements = document.querySelectorAll('[role="alert"]');
          return Array.from(errorElements).map(el => el.textContent).join(', ');
        });
        console.error('Error messages on page:', errorText);
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
