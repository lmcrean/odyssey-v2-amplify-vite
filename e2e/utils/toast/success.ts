import { Page, expect } from '@playwright/test';

/**
 * Verify that a success toast message is displayed
 */
export async function expectSuccessToast(page: Page, message: string) {
  const toast = page.locator('.Toastify__toast--success');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(message);
} 