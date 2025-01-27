import { Page } from '@playwright/test';

/**
 * Fill in the sign-up form with the provided credentials
 */
export async function fillSignUpForm(page: Page, email: string, password: string, confirmPassword: string) {
  // Wait for the sign-up form to be visible
  await page.waitForSelector('form[data-amplify-authenticator-signup]');
  
  await page.fill('input[name="email"][type="email"]', email);
  await page.fill('input[name="password"][type="password"]', password);
  await page.fill('input[name="confirm_password"][type="password"]', confirmPassword);
} 