import { Page, expect } from '@playwright/test';

/**
 * Verify that an error toast message is displayed
 */
export async function expectErrorToast(page: Page, message: string) {
  const toast = page.locator('.Toastify__toast--error');
  await expect(toast).toBeVisible();
  await expect(toast).toContainText(message);
} 