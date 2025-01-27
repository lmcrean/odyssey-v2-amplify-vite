import { Page } from '@playwright/test';

/**
 * Click the delete account button
 */
export async function clickDeleteAccount(page: Page) {
  await page.getByRole('button', { name: /delete account/i }).click();
} 