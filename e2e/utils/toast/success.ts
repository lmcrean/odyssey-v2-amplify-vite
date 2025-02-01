import { Page, expect } from '@playwright/test';

/**
 * Verify that a success toast message is displayed
 */
export async function expectSuccessToast(page: Page, message: string) {
  console.log('expectSuccessToast', message);
  
  // Wait for toast container to be mounted
  await page.waitForSelector('.Toastify', { state: 'attached' });
  
  // Find all success toasts with specific message
  const toasts = page.locator('.Toastify__toast--success', {
    hasText: message
  });

  // Wait for at least one toast to be visible
  await expect(toasts.first()).toBeVisible({ timeout: 10000 });
  
  // Verify the exact message
  await expect(toasts.first()).toContainText(message);

  // Verify there is exactly one toast with this message
  await expect(toasts).toHaveCount(1, { timeout: 10000 });
} 