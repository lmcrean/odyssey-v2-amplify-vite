import { Page } from '@playwright/test';

/**
 * Fill in the sign-up form with the provided credentials
 */
export async function fillSignUpForm(page: Page, email: string, password: string, confirmPassword: string) {
  // Wait for the sign-up form to be visible
  await page.waitForSelector('form[data-amplify-authenticator-signup]');
  
  // Fill email field
  await page.locator('input[type="email"]').fill(email);
  
  // Fill password field - using the first password field
  await page.locator('input[type="password"]').first().fill(password);
  
  // Fill confirm password field using placeholder
  await page.locator('input[placeholder="Confirm Password"]').fill(confirmPassword);
} 