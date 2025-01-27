import { Page } from '@playwright/test';

/**
 * Fill in the sign-in form with the provided credentials
 */
export async function fillSignInForm(page: Page, email: string, password: string) {
  await page.fill('input[name="username"][type="email"]', email);
  await page.fill('input[name="password"][type="password"]', password);
} 