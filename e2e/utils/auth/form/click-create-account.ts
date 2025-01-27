import { Page } from '@playwright/test';

/**
 * Click the create account button
 */
export async function clickCreateAccount(page: Page) {
  await page.click('button:has-text("Create Account")');
} 