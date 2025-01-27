import { test, expect } from '@playwright/test';

test.describe('Basic App Setup', () => {
  test('app loads and renders Amplify UI', async ({ page }) => {
    // Capture all console logs
    const logs: { type: string; text: string }[] = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
      console.log(`Browser ${msg.type()}: ${msg.text()}`);
    });

    // Navigate to the app
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173');
    
    // Wait for any content to load with increased timeouts
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Wait for root element first
    const root = page.locator('#root');
    await root.waitFor({ state: 'attached', timeout: 30000 });
    
    // Wait for and verify Amplify UI elements
    const signInTab = page.locator('button[role="tab"]:has-text("Sign In")');
    const signUpTab = page.locator('button[role="tab"]:has-text("Create Account")');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.locator('button[type="submit"]:has-text("Sign in")');
    
    // Verify all elements are visible
    await expect(signInTab).toBeVisible();
    await expect(signUpTab).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signInButton).toBeVisible();
  });

  test('app loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`Browser error: ${msg.text()}`);
      }
    });

    await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Log any errors found
    if (errors.length > 0) {
      console.log('Found browser errors:', errors);
    }
    
    // Filter out the util module warning as it's expected
    const realErrors = errors.filter(error => !error.includes('Module "util" has been externalized'));
    expect(realErrors).toEqual([]);
  });
}); 