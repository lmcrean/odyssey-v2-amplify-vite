import { Page } from '@playwright/test';
import { verifyTestUser } from './backend/verify-test-user';

export interface CreateAndSignInUserResult {
  email: string;
  password: string;
}

export async function createAndSignInUser(page: Page): Promise<CreateAndSignInUserResult> {
  // 1. Create random user with UI - generate unique email
  const uniqueEmail = `test-${Date.now()}@example.com`;
  const password = 'Test123!@#';

  // Click the Create Account tab
  await page.getByRole('tab', { name: /create account/i }).click();
  await page.waitForTimeout(500); // Small delay for tab switch

  // 2. Sign up with UI
  await page.getByLabel(/email/i).fill(uniqueEmail);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByLabel(/confirm password/i).fill(password);
  await page.getByRole('button', { name: /create account/i }).click();

  // Wait for confirmation screen
  await page.getByText(/we emailed you/i).waitFor({ timeout: 5000 });

  // 3. Auto-verify the user using AWS Admin API
  await verifyTestUser(uniqueEmail);

  // After verification, we need to reload the page to get back to the sign-in form
  await page.reload();
  await page.waitForLoadState('networkidle');

  // 4. Sign in with UI
  await page.getByLabel(/email/i).fill(uniqueEmail);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // Handle account recovery setup - click Skip
  await page.getByText(/account recovery requires verified contact information/i)
    .waitFor({ timeout: 5000 });
  await page.getByRole('button', { name: /skip/i }).click();

  // 5. Verify Auth view
  await page.getByText(/hello/i).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: /sign out/i })
    .waitFor({ timeout: 5000 });

  return {
    email: uniqueEmail,
    password
  };
} 