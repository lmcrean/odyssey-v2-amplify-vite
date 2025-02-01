import { test, expect } from '@playwright/test';
import { verifyTestUser } from '../../../utils/auth/backend/verify-test-user';

test.describe('Complete Auth Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('completes full auth lifecycle including account changes and deletion', async ({ page }) => {
    // 1. Create random user with UI - generate unique email
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const password = 'Test123!@#';

    // Click the Create Account tab
    await page.getByRole('tab', { name: /create account/i }).click();
    await page.waitForTimeout(500); // Small delay for tab switch

    // 2. Sign up with UI
    await page.getByLabel(/email/i).fill(uniqueEmail);
    await page.getByLabel(/^password$/i).fill(password);
    await page.getByLabel(/confirm password/i).fill(password);
    await page.getByRole('button', { name: /create account/i }).click();

    // Wait for confirmation screen
    await expect(page.getByText(/we emailed you/i)).toBeVisible({ timeout: 5000 });

    // 3. Auto-verify the user using AWS Admin API
    await verifyTestUser(uniqueEmail);

    // After verification, we need to reload the page to get back to the sign-in form
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 4. Sign in with UI
    await page.getByLabel(/email/i).fill(uniqueEmail);
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
      // Open change display name modal
      await page.getByTestId('open-change-display-name-modal').click();
      await page.waitForTimeout(500); // Wait for modal to open
      await page.getByLabel(/new display name/i).fill(`New Name ${i}`);
      await page.getByTestId('submit-change-display-name').click();
      
      // Wait for success toast and modal to close
      await expect(page.getByText(/display name changed successfully/i))
        .toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000); // Wait for modal to close completely
    }

    // 7. Change password three times
    let currentPassword = password;
    for (let i = 1; i <= 3; i++) {
      const newPassword = `NewPass${i}123!@#`;
      
      // Open change password modal
      await page.getByTestId('open-change-password-modal').click();
      await page.waitForTimeout(500); // Wait for modal to open
      
      // Fill in password form
      await page.getByLabel(/current password/i).fill(currentPassword);
      await page.getByLabel(/^new password$/i).fill(newPassword);
      await page.getByLabel(/confirm new password/i).fill(newPassword);
      
      // Submit password change
      await page.getByTestId('submit-change-password').click();
      
      // Wait for success toast and modal to close
      await expect(page.getByText(/password changed successfully/i))
        .toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000); // Wait for modal to close completely
      
      currentPassword = newPassword;
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
