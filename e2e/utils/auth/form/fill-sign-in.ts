import { Page } from '@playwright/test';

/**
 * Fill in the sign-in form with the provided credentials
 * Waits for fields to be visible and enabled before filling
 */
export async function fillSignInForm(page: Page, email: string, password: string) {
  // Get form fields
  const emailField = page.locator('input[name="username"][type="email"]');
  const passwordField = page.locator('input[name="password"][type="password"]');
  
  // Wait for fields to be ready
  await emailField.waitFor({ state: 'visible', timeout: 5000 });
  await emailField.waitFor({ state: 'enabled', timeout: 5000 });
  
  await passwordField.waitFor({ state: 'visible', timeout: 5000 });
  await passwordField.waitFor({ state: 'enabled', timeout: 5000 });
  
  // Clear fields first
  await emailField.clear();
  await passwordField.clear();
  
  // Fill in the fields
  await emailField.fill(email);
  await passwordField.fill(password);
  
  // Verify fields were filled correctly
  const filledEmail = await emailField.inputValue();
  const filledPassword = await passwordField.inputValue();
  
  if (filledEmail !== email || filledPassword !== password) {
    throw new Error('Form fields were not filled correctly');
  }
} 