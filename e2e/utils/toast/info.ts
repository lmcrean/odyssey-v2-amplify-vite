import { Page, expect } from '@playwright/test';

/**
 * Verify that an info toast message is displayed
 */
export async function expectInfoToast(page: Page, message: string) {
  const toast = page.locator('.Toastify__toast--info');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(message);
} 