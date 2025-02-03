import { Page, expect } from '@playwright/test';

export interface DeleteAccountOptions {
  page: Page;
  takeScreenshots?: boolean;
}

export async function deleteAccount(options: DeleteAccountOptions): Promise<void> {
  const { page, takeScreenshots = true } = options;

  console.log('Starting account deletion process...');
  
  // Wait for network idle before starting
  await page.waitForLoadState('networkidle');
  
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
    if (takeScreenshots) {
      try {
        await page.screenshot({ path: 'delete-button-error.png' });
      } catch (screenshotError) {
        console.error('Could not take error screenshot:', screenshotError);
      }
    }
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
    if (takeScreenshots) {
      try {
        await page.screenshot({ path: 'confirm-button-error.png' });
      } catch (screenshotError) {
        console.error('Could not take error screenshot:', screenshotError);
      }
    }
    throw error;
  }
  
  // Wait for network idle after deletion request
  await page.waitForLoadState('networkidle');
  
  // Verify account deletion success with increased timeout
  await expect(page.getByText(/account deleted successfully/i))
    .toBeVisible({ timeout: 10000 });
  console.log('Saw deletion success message');
    
  // Verify we're back at the sign-in screen
  await expect(page.getByRole('tab', { name: /sign in/i }))
    .toBeVisible({ timeout: 10000 });
  console.log('Back at sign-in screen');
} 