import { test, expect } from './test-setup';

test.describe('Basic App Setup', () => {
  test('app loads and renders Amplify UI', async ({ page }) => {
    // Capture all console logs
    const logs: { type: string; text: string }[] = [];
    page.on('console', msg => {
      logs.push({ type: msg.type(), text: msg.text() });
      console.log(`Browser ${msg.type()}: ${msg.text()}`);
    });

    // Navigate to the app
    await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5175');
    
    // Wait for any content to load with increased timeouts
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });

    // Wait for root element first
    const root = page.locator('#root');
    await root.waitFor({ state: 'attached', timeout: 30000 });
    
    // Wait for and verify Amplify UI elements with increased timeouts
    const signInTab = page.locator('button[role="tab"]:has-text("Sign In")');
    const signUpTab = page.locator('button[role="tab"]:has-text("Create Account")');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const signInButton = page.locator('button[type="submit"]:has-text("Sign in")');
    
    // Verify all elements are visible with increased timeouts
    await expect(signInTab).toBeVisible({ timeout: 10000 });
    await expect(signUpTab).toBeVisible({ timeout: 10000 });
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await expect(passwordInput).toBeVisible({ timeout: 10000 });
    await expect(signInButton).toBeVisible({ timeout: 10000 });
  });

  test('app loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
        console.log(`Browser error: ${msg.text()}`);
      }
    });

    await page.goto(process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5175');
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // Log any errors found
    if (errors.length > 0) {
      console.log('Found browser errors:', errors);
    }
    
    // Filter out the util module warning as it's expected
    const realErrors = errors.filter(error => !error.includes('Module "util" has been externalized'));
    expect(realErrors).toEqual([]);
  });

  test('Tailwind CSS and theme are working correctly', async ({ page }) => {
    // Navigate to the Tailwind test page
    const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5175';
    await page.goto(`${baseUrl}/tailwind-test`);
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Get the container div with gradient background and verify its classes
    const container = page.locator('[data-testid="tailwind-container"]');
    await expect(container).toBeVisible({ timeout: 10000 });
    const containerClasses = await container.getAttribute('class');
    expect(containerClasses).toMatch(/min-h-screen/);
    expect(containerClasses).toMatch(/bg-gradient-to-r/);
    expect(containerClasses).toMatch(/from-blue-500/);
    expect(containerClasses).toMatch(/to-purple-500/);
    expect(containerClasses).toMatch(/flex/);
    expect(containerClasses).toMatch(/items-center/);
    expect(containerClasses).toMatch(/justify-center/);

    // Get the white card container and verify its classes
    const card = page.locator('[data-testid="tailwind-card"]');
    await expect(card).toBeVisible({ timeout: 10000 });
    const cardClasses = await card.getAttribute('class');
    expect(cardClasses).toMatch(/bg-white/);
    expect(cardClasses).toMatch(/p-8/);
    expect(cardClasses).toMatch(/rounded-lg/);
    expect(cardClasses).toMatch(/shadow-lg/);

    // Get the heading and verify its classes
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });
    const headingClasses = await heading.getAttribute('class');
    expect(headingClasses).toMatch(/text-3xl/);
    expect(headingClasses).toMatch(/font-bold/);
    expect(headingClasses).toMatch(/text-gray-800/);
    expect(headingClasses).toMatch(/mb-4/);

    // Get the paragraph and verify its classes
    const paragraph = page.locator('p');
    await expect(paragraph).toBeVisible({ timeout: 10000 });
    const paragraphClasses = await paragraph.getAttribute('class');
    expect(paragraphClasses).toMatch(/text-red-600/);
    expect(paragraphClasses).toMatch(/hover:text-blue-500/);
    expect(paragraphClasses).toMatch(/transition-colors/);
  });
}); 