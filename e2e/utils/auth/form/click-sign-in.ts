import { Page } from '@playwright/test';

/**
 * Click the sign-in button
 */
export async function clickSignIn(page: Page) {
  await page.click('button:has-text("Sign in")');
} 