import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Click the sign-in button and wait for navigation
 */
export async function clickSignIn(page: Page) {
  // Find the sign in button
  const signInButton = page.getByRole('button', { name: 'Sign in' });
  
  // Wait for button to be visible and enabled
  await signInButton.waitFor({ state: 'visible', timeout: 5000 });
  await expect(signInButton).toBeEnabled();
  
  // Click and wait for navigation
  await Promise.all([
    page.waitForLoadState('networkidle'),
    signInButton.click()
  ]);
} 