import { test, expect } from '@playwright/test';
import { verifyTestUser } from '../../../utils/auth/backend/verify-test-user';
import { deleteTestAccount } from '../../../utils/auth/backend/delete-test-account';

test.describe('Change Password Flow', () => {
  let testUserEmail: string;
  let currentPassword: string;

  test.afterAll(async () => {
    try {
      // Clean up test account if email exists
      if (testUserEmail) {
        await deleteTestAccount(testUserEmail);
        console.log('Successfully cleaned up test account:', testUserEmail);
      }
    } catch (error) {
      console.log('Cleanup error (can be ignored):', error);
    }
  });

  test.beforeEach(async ({ page }) => {
    // Navigate to home and wait for load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    console.log('Initial page load complete');
  });

  test('changes password three times successfully', async ({ page }) => {
    // 1. Create a new test user
    const timestamp = Date.now();
    testUserEmail = `test-${timestamp}@example.com`;
    currentPassword = 'Test123!@#';

    console.log('Creating new test user:', testUserEmail);

    // Click the Create Account tab
    await page.getByRole('tab', { name: /create account/i }).click();
    await page.waitForTimeout(500); // Small delay for tab switch

    // Fill in the form
    await page.getByLabel(/email/i).fill(testUserEmail);
    await page.getByLabel(/^password$/i).fill(currentPassword);
    await page.getByLabel(/confirm password/i).fill(currentPassword);
    
    // Debug: Log form values before submission
    console.log('Form values before submission:', {
      email: await page.getByLabel(/email/i).inputValue(),
      password: '***',
      confirmPassword: '***'
    });

    // Click create account and wait for response
    const createAccountButton = page.getByRole('button', { name: /create account/i });
    await Promise.all([
      page.waitForResponse(response => response.url().includes('cognito') || response.url().includes('oauth2')),
      createAccountButton.click()
    ]);

    // Wait for network requests to complete
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    console.log('Page loaded after account creation');

    // Wait for any loading state to appear and disappear
    try {
      await expect(page.getByText(/creating account|signing up/i)).toBeVisible({ timeout: 5000 });
      console.log('Saw loading message');
      await expect(page.getByText(/creating account|signing up/i)).not.toBeVisible({ timeout: 10000 });
      console.log('Loading message disappeared');
    } catch (error) {
      console.log('Could not track loading message state:', error.message);
    }

    // Debug: Log all text on the page
    const accountCreationText = await page.evaluate(() => document.body.innerText);
    console.log('Page text after account creation:', accountCreationText);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'after-account-creation.png' });

    // Check for error messages first
    const errorLocator = page.getByText(/error|failed|invalid|exceeded.*limit|limit.*exceeded/i);
    try {
      await expect(errorLocator).toBeVisible({ timeout: 5000 });
      const errorText = await errorLocator.textContent();
      console.error('Account creation error:', errorText);

      // Debug: Log all text on the page
      const errorPageText = await page.evaluate(() => document.body.innerText);
      console.log('Full page text during error:', errorPageText);

      // Take a screenshot for debugging
      await page.screenshot({ path: 'error-state.png' });

      // If we hit email limits, try signing in with the test account
      if (errorPageText?.toLowerCase().includes('exceeded') && errorPageText?.toLowerCase().includes('limit')) {
        console.log('Hit email limit, attempting to use test account directly...');
        testUserEmail = process.env.TEST_USER_EMAIL || 'test-delete-account@example.com';
        currentPassword = process.env.TEST_USER_PASSWORD || 'Test123!@#';
        
        // Go back to sign in
        await page.getByRole('tab', { name: /sign in/i }).click();
        await page.waitForTimeout(500);
      } else {
        throw new Error(`Account creation failed: ${errorText}`);
      }
    } catch (error) {
      if (error.message.includes('Account creation failed')) {
        throw error;
      }
      console.log('No error messages found, continuing with confirmation screen check...');

      // Wait for confirmation screen
      const confirmationTexts = [
        /verify your email/i,
        /confirm your email/i,
        /confirmation code/i,
        /verification code/i,
        /check your email/i
      ];

      let confirmationFound = false;
      for (const text of confirmationTexts) {
        try {
          await expect(page.getByText(text)).toBeVisible({ timeout: 5000 });
          confirmationFound = true;
          console.log(`Found confirmation text matching: ${text}`);
          break;
        } catch (error) {
          console.log(`Did not find text matching: ${text}`);
        }
      }

      if (!confirmationFound) {
        console.error('Could not find any confirmation screen text');
        await page.screenshot({ path: 'confirmation-screen-error.png' });
        throw new Error('Could not find confirmation screen');
      }

      // Auto-verify the user using AWS Admin API
      await verifyTestUser(testUserEmail);
      console.log('Verified test user');

      // After verification, reload the page to get back to the sign-in form
      await page.reload();
      await page.waitForLoadState('networkidle');
    }

    // 2. Sign in with the user
    console.log('Attempting to sign in...');
    
    // Wait for and click the sign in tab
    await page.getByRole('tab', { name: /sign in/i }).click();
    console.log('Clicked sign in tab');

    // Fill in credentials
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/^password$/i);
    
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    await expect(passwordInput).toBeVisible({ timeout: 5000 });
    
    await emailInput.fill(testUserEmail);
    await passwordInput.fill(currentPassword);
    console.log('Filled in credentials');

    // Click sign in and wait for response
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await Promise.all([
      page.waitForResponse(response => response.url().includes('cognito') || response.url().includes('oauth2')),
      signInButton.click()
    ]);
    console.log('Clicked sign in and got response');

    // Wait for loading state to appear and disappear
    try {
      await expect(page.getByText(/signing in/i)).toBeVisible({ timeout: 5000 });
      console.log('Saw signing in message');
      await expect(page.getByText(/signing in/i)).not.toBeVisible({ timeout: 10000 });
      console.log('Signing in message disappeared');
    } catch (error) {
      console.log('Could not track signing in message state:', error.message);
    }

    // Wait for any error messages
    try {
      const errorLocator = page.getByText(/error|failed|invalid|incorrect/i);
      const hasError = await errorLocator.isVisible({ timeout: 2000 });
      if (hasError) {
        const errorText = await errorLocator.textContent();
        console.error('Sign in error:', errorText);
        throw new Error(`Sign in failed: ${errorText}`);
      }
    } catch (error) {
      if (error.message.includes('Sign in failed')) {
        throw error;
      }
      console.log('No error messages found, continuing...');
    }

    // Wait for network idle and DOM content loaded
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    console.log('Page loaded after sign in');

    // Debug: Log all text on the page
    const signInText = await page.evaluate(() => document.body.innerText);
    console.log('Page text after sign in:', signInText);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'after-signin.png' });

    // Check if we're still on the sign in page
    const isStillOnSignIn = await page.getByRole('tab', { name: /sign in/i }).isVisible();
    if (isStillOnSignIn) {
      console.error('Still on sign in page after attempt');
      throw new Error('Sign in did not complete successfully');
    }

    // Verify we're logged in by checking for authenticated UI elements
    await expect(page.getByRole('button', { name: /sign out/i }))
      .toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('open-change-password-modal'))
      .toBeVisible({ timeout: 5000 });
    console.log('Successfully signed in - authenticated UI elements visible');

    // Handle account recovery setup - click Skip if it appears
    try {
      await expect(page.getByText(/account recovery requires verified contact information/i))
        .toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /skip/i }).click();
      console.log('Skipped account recovery setup');
    } catch (error) {
      console.log('No account recovery prompt found, continuing...');
    }

    // 3. Change password three times
    for (let i = 1; i <= 3; i++) {
      console.log(`\nAttempting password change ${i}`);
      try {
        const newPassword = `NewPass${i}123!@#`;
        
        // Wait for any previous toasts to disappear
        try {
          await page.waitForFunction(() => {
            const toasts = document.querySelectorAll('[role="alert"]');
            return toasts.length === 0;
          }, { timeout: 5000 });
        } catch (error) {
          console.log('No previous toasts found or timed out waiting for them to disappear');
        }
        
        // Open change password modal
        const changePasswordButton = page.getByTestId('open-change-password-modal');
        await expect(changePasswordButton).toBeVisible({ timeout: 10000 });
        await changePasswordButton.click();
        console.log('Clicked change password button');

        // Fill in the form
        const currentPasswordInput = page.getByLabel(/current password/i);
        await expect(currentPasswordInput).toBeVisible({ timeout: 5000 });
        await currentPasswordInput.fill(currentPassword);
        
        const newPasswordInput = page.getByLabel(/^new password$/i);
        await expect(newPasswordInput).toBeVisible({ timeout: 5000 });
        await newPasswordInput.fill(newPassword);
        
        const confirmPasswordInput = page.getByLabel(/confirm.*password/i);
        await expect(confirmPasswordInput).toBeVisible({ timeout: 5000 });
        await confirmPasswordInput.fill(newPassword);
        console.log('Filled password form');

        // Submit and wait for success
        const submitButton = page.getByTestId('submit-change-password');
        await submitButton.click();
        console.log('Submitted password change');

        // Wait for success message
        await expect(page.getByText(/password changed successfully/i))
          .toBeVisible({ timeout: 10000 });
        console.log('Saw success message');

        // Wait for modal to close
        await expect(currentPasswordInput).not.toBeVisible({ timeout: 5000 });
        console.log('Modal closed');

        // Update current password for next iteration
        currentPassword = newPassword;
        console.log(`Completed password change attempt ${i}`);

        // Take success screenshot
        await page.screenshot({ path: `password-change-success-${i}.png` });

        // Wait between attempts
        await page.waitForTimeout(5000);

      } catch (error) {
        console.error(`Failed to change password in attempt ${i}:`, error);
        // Take error screenshot
        await page.screenshot({ path: `password-change-error-${i}.png` });
        throw error;
      }
    }

    // 4. Verify we can sign in with the final password
    console.log('\nVerifying final password works...');
    
    // Sign out
    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page.getByRole('tab', { name: /sign in/i }))
      .toBeVisible({ timeout: 5000 });
    console.log('Signed out successfully');

    // Sign in with new password
    await page.getByLabel(/email/i).fill(testUserEmail);
    await page.getByLabel(/^password$/i).fill(currentPassword);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Verify successful sign in
    await expect(page.getByText(/hello/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /sign out/i }))
      .toBeVisible({ timeout: 5000 });
    console.log('Successfully signed in with final password');
  });
}); 