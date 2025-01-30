import { Page } from '@playwright/test';

/**
 * Fill in the sign-in form with the provided credentials
 * Waits for fields to be visible and enabled before filling
 */
export async function fillSignInForm(page: Page, email: string, password: string) {
  // Wait for the form to be ready and visible
  await page.waitForLoadState('networkidle');
  
  // Get form fields using the labels shown in the screenshot
  const emailField = page.getByLabel('Email');
  const passwordField = page.getByLabel('Password');
  
  // Wait for fields to be ready
  await emailField.waitFor({ state: 'visible', timeout: 5000 });
  await emailField.waitFor({ state: 'enabled', timeout: 5000 });
  
  await passwordField.waitFor({ state: 'visible', timeout: 5000 });
  await passwordField.waitFor({ state: 'enabled', timeout: 5000 });
  
  // Fill in the fields
  await emailField.fill(email);
  await passwordField.fill(password);
  
  // Click the Sign in button
  const signInButton = page.getByRole('button', { name: 'Sign in' });
  await signInButton.click();
} 