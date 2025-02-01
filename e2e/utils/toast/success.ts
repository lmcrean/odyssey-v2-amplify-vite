import { Page, expect } from '@playwright/test';

/**
 * Verify that a success toast message is displayed
 */
export async function expectSuccessToast(page: Page, message: string) {
  console.log('expectSuccessToast', message);
  
  // Wait for toast container to be mounted
  await page.waitForSelector('.Toastify', { state: 'attached' });
  
  const toast = page.locator('.Toastify__toast--success');
  // if not visible, scan the page for what elements we can see
  
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(message);
} 