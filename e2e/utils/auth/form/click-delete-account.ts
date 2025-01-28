import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Click the delete account button and wait for modal
 */
export async function clickDeleteAccount(page: Page) {
  // Find the delete account button
  const deleteAccountButton = page.getByRole('button', { name: 'Delete Account' });
  
  // Wait for button to be visible and enabled
  await deleteAccountButton.waitFor({ state: 'visible', timeout: 5000 });
  await expect(deleteAccountButton).toBeEnabled();
  
  // Click and wait for modal
  await Promise.all([
    page.locator('.fixed.inset-0').waitFor({ state: 'visible', timeout: 5000 }),
    deleteAccountButton.click()
  ]);
} 