import { test, expect } from '@playwright/test';
import { fillSignInForm } from '../../../utils/auth/form/fill-sign-in';
import { expectSuccessToast } from '../../../utils/toast';

test.describe('Valid Sign In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Log the current URL
    console.log('Current URL:', page.url());
    
    // Wait for any initial animations/transitions
    await page.waitForTimeout(2000);
  });

  test('completes sign in process', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL;
    const testPassword = process.env.TEST_USER_PASSWORD;
    
    if (!testEmail || !testPassword) {
      throw new Error('Test user credentials not found in environment variables');
    }

    console.log('Starting sign in process...');
    
    // Wait for the sign in tab to be visible
    const signInTab = page.getByRole('tab', { name: 'Sign In' });
    await expect(signInTab).toBeVisible();
    
    await fillSignInForm(page, testEmail, testPassword);

    console.log('Waiting for success toast...');
    await expectSuccessToast(page, 'Successfully signed in');
    
    console.log('Waiting for sign out button...');
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible();
    console.log('Test completed successfully');
  });
}); 