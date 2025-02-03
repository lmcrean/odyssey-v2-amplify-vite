import { Page, expect } from '@playwright/test';
import { changePassword } from './change-password';

export interface PasswordStressTestResult {
  finalPassword: string;
}

export interface PasswordStressTestOptions {
  page: Page;
  initialPassword: string;
  userEmail: string;
  iterations?: number;
  takeScreenshots?: boolean;
  waitBetweenAttempts?: number;
}

export async function runPasswordChangeStressTest(options: PasswordStressTestOptions): Promise<PasswordStressTestResult> {
  const {
    page,
    initialPassword,
    userEmail,
    iterations = 3,
    takeScreenshots = true,
    waitBetweenAttempts = 2000
  } = options;

  let currentPassword = initialPassword;

  // Change password multiple times
  for (let i = 1; i <= iterations; i++) {
    console.log(`\nAttempting password change ${i}`);
    try {
      // Wait for network idle before starting next iteration
      await page.waitForLoadState('networkidle');
      
      const newPassword = `NewPass${i}123!@#`;
      
      // Change password using utility
      await changePassword(page, {
        currentPassword,
        newPassword,
        waitForToastsToClear: true
      });

      // Update current password for next iteration
      currentPassword = newPassword;
      console.log(`Completed password change attempt ${i}`);

      // Take success screenshot if enabled
      if (takeScreenshots) {
        await page.waitForLoadState('networkidle');
        await page.screenshot({ path: `password-change-success-${i}.png` });
      }

      // Wait for network idle between attempts instead of fixed timeout
      if (i < iterations) {
        await page.waitForLoadState('networkidle');
        // Add a small buffer time to ensure UI is fully settled
        await page.waitForTimeout(500);
      }

    } catch (error) {
      console.error(`Failed to change password in attempt ${i}:`, error);
      // Take error screenshot if enabled
      if (takeScreenshots) {
        try {
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: `password-change-error-${i}.png` });
        } catch (screenshotError) {
          console.error('Could not take error screenshot:', screenshotError);
        }
      }
      throw error;
    }
  }

  // Verify final password works by signing out and back in
  console.log('\nVerifying final password works...');
  
  // Wait for network idle before sign out
  await page.waitForLoadState('networkidle');
  
  // Sign out with explicit waits
  const signOutButton = page.getByRole('button', { name: /sign out/i });
  await expect(signOutButton).toBeVisible({ timeout: 10000 });
  await signOutButton.click();
  
  // Wait for sign out to complete
  await page.waitForLoadState('networkidle');
  
  await expect(page.getByRole('tab', { name: /sign in/i }))
    .toBeVisible({ timeout: 10000 });
  console.log('Signed out successfully');

  // Sign in with new password
  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/^password$/i);
  const signInButton = page.getByRole('button', { name: /sign in/i });

  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(userEmail);
  await expect(passwordInput).toBeVisible({ timeout: 10000 });
  await passwordInput.fill(currentPassword);
  await signInButton.click();

  // Wait for sign in to complete
  await page.waitForLoadState('networkidle');

  // Handle account recovery setup - click Skip
  await page.getByText(/account recovery requires verified contact information/i)
    .waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: /skip/i }).click();

  // Wait for skip action to complete
  await page.waitForLoadState('networkidle');

  // Verify Auth view using the same pattern as create-and-sign-in-user.ts
  await page.getByText(/hello/i).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: /sign out/i })
    .waitFor({ timeout: 10000 });
  console.log('Successfully signed in with final password');

  return {
    finalPassword: currentPassword
  };
} 