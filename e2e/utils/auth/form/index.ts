import { Page } from '@playwright/test';

export const fillSignInForm = async (page: Page, email: string, password: string) => {
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
};

export const fillSignUpForm = async (page: Page, email: string, password: string, confirmPassword: string) => {
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('input[placeholder="Confirm Password"]').fill(confirmPassword);
};

export const submitForm = async (page: Page) => {
  await page.locator('button[type="submit"]').click();
};

export const switchToSignUpTab = async (page: Page) => {
  await page.locator('button[role="tab"]:has-text("Create Account")').click();
};

export const switchToSignInTab = async (page: Page) => {
  await page.locator('button[role="tab"]:has-text("Sign In")').click();
};

export { clickSignIn } from './click-sign-in';
export { clickCreateAccount } from './click-create-account';
export { clickSignOut } from './click-sign-out';
export { clickDeleteAccount } from './click-delete-account'; 