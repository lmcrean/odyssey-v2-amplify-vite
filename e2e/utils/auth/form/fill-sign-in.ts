import { Page } from '@playwright/test';

/**
 * Fill in the sign-in form with the provided credentials
 * Waits for fields to be visible and enabled before filling
 */
export async function fillSignInForm(page: Page, email: string, password: string) {
  // Wait for the form to be ready and visible
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  
  // Get form fields using the labels
  const emailField = page.getByLabel('Email', { exact: true });
  const passwordField = page.getByLabel('Password', { exact: true });
  
  // Wait for fields to be ready with proper error handling
  try {
    await emailField.waitFor({ state: 'visible', timeout: 5000 });
    await passwordField.waitFor({ state: 'visible', timeout: 5000 });
    
    // Fill in the fields
    await emailField.fill(email);
    await passwordField.fill(password);
    
    // Click the Sign in button
    const signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
    await signInButton.waitFor({ state: 'visible', timeout: 5000 });
    await signInButton.click();
  } catch (error) {
    console.error('Error in fillSignInForm:', error);
    throw new Error(`Failed to fill sign in form: ${error.message}`);
  }
} 