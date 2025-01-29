import { Page } from '@playwright/test';

/**
 * Fill in the sign-up form with the provided credentials
 */
export async function fillSignUpForm(page: Page, email: string, password: string, confirmPassword: string) {
  // Wait for the sign-up form to be visible and fully loaded
  await page.waitForSelector('[data-testid="authenticator-form"]', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  // Fill in the form fields
  const emailField = page.getByLabel('Email');
  const passwordField = page.locator('input[name="password"]').first();
  const confirmPasswordField = page.locator('input[name="confirm_password"]');
  
  await emailField.waitFor({ state: 'visible', timeout: 5000 });
  await emailField.fill(email);
  
  await passwordField.waitFor({ state: 'visible', timeout: 5000 });
  await passwordField.fill(password);
  
  await confirmPasswordField.waitFor({ state: 'visible', timeout: 5000 });
  await confirmPasswordField.fill(confirmPassword);
}

/**
 * Click the Create Account button
 */
export async function clickCreateAccount(page: Page) {
  const createAccountButton = page.getByRole('button', { name: 'Create Account' });
  await createAccountButton.click();
}

/**
 * Fill in the sign-in form with the provided credentials
 */
export async function fillSignInForm(page: Page, email: string, password: string) {
  // Wait for the sign-in form to be visible and fully loaded
  await page.waitForSelector('[data-testid="authenticator-form"]', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  
  // Fill in the form fields
  const emailField = page.getByLabel('Email');
  const passwordField = page.locator('input[name="password"]').first();
  
  await emailField.waitFor({ state: 'visible', timeout: 5000 });
  await emailField.fill(email);
  
  await passwordField.waitFor({ state: 'visible', timeout: 5000 });
  await passwordField.fill(password);
}

/**
 * Click the Sign In button
 */
export async function clickSignIn(page: Page) {
  const signInButton = page.getByRole('button', { name: 'Sign in' });
  await signInButton.click();
} 