import { Page } from '@playwright/test';

/**
 * Click the sign-out button
 */
export async function clickSignOut(page: Page) {
  await page.getByRole('button', { name: /sign out/i }).click();
} 