import { Page, expect } from '@playwright/test';

export interface ChangePasswordOptions {
  currentPassword: string;
  newPassword: string;
  waitForToastsToClear?: boolean;
}

export async function changePassword(page: Page, options: ChangePasswordOptions): Promise<void> {
  const { currentPassword, newPassword, waitForToastsToClear = true } = options;

  // Wait for any previous toasts to disappear if requested
  if (waitForToastsToClear) {
    try {
      await page.waitForFunction(() => {
        const toasts = document.querySelectorAll('[role="alert"]');
        return toasts.length === 0;
      }, { timeout: 10000 });
    } catch (error) {
      console.log('No previous toasts found or timed out waiting for them to disappear');
    }
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
}
