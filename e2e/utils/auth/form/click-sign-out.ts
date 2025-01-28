import { Page } from '@playwright/test';
import { expect } from '@playwright/test';

/**
 * Click the sign-out button and wait for sign-in form
 */
export async function clickSignOut(page: Page) {
  // Find the sign out button
  const signOutButton = page.getByRole('button', { name: 'Sign Out' });
  
  // Wait for button to be visible and enabled
  await signOutButton.waitFor({ state: 'visible', timeout: 5000 });
  await expect(signOutButton).toBeEnabled();
  
  // Click and wait for sign-in form
  await Promise.all([
    page.locator('form[data-amplify-form]').waitFor({ state: 'visible', timeout: 10000 }),
    signOutButton.click()
  ]);
  
  // Verify we're back on the sign-in form
  const signInTab = page.locator('[role="tab"]').filter({ hasText: 'Sign In' });
  await signInTab.waitFor({ state: 'visible', timeout: 5000 });
  await expect(signInTab).toHaveAttribute('aria-selected', 'true');
} 