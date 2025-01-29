import { test, expect } from '@playwright/test';
import { fillSignInForm } from '../../utils/auth/form';
import { AUTH_VIEW_TEST_USER } from '../../../src/__tests__/backend/auth/fixtures/authenticated-view-user.test';

test.describe('Authenticated View', () => {
  test.beforeEach(async ({ page }) => {
    // Enable verbose console logging
    page.on('console', msg => {
      console.log(`Browser ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.error('Page error:', error);
    });

    page.on('requestfailed', request => {
      console.error('Failed request:', request.url(), request.failure()?.errorText);
    });

    // Start from home and wait for auth form
    console.log('Navigating to home page');
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for auth form to be visible
    console.log('Waiting for auth form');
    const authForm = page.locator('form[data-amplify-form]');
    await expect(authForm).toBeVisible({ timeout: 10000 });
    
    // Ensure we're on the sign-in tab
    console.log('Checking sign-in tab');
    const signInTab = page.locator('[role="tab"]').filter({ hasText: 'Sign In' });
    if (await signInTab.isVisible()) {
      await signInTab.click();
      await expect(signInTab).toHaveAttribute('aria-selected', 'true');
    }
    
    // Wait for the sign-in form fields
    console.log('Waiting for sign-in form fields');
    const emailField = page.locator('input[name="username"][type="email"]');
    const passwordField = page.locator('input[name="password"][type="password"]');
    
    await expect(emailField).toBeVisible({ timeout: 5000 });
    await expect(passwordField).toBeVisible({ timeout: 5000 });
    
    // Fill and submit the form
    console.log('Filling sign-in form');
    await fillSignInForm(page, AUTH_VIEW_TEST_USER.email, AUTH_VIEW_TEST_USER.password);
    
    // Click sign in button
    console.log('Clicking sign in');
    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();
    
    // Wait for any loading states or transitions
    await page.waitForLoadState('networkidle');
    
    // Check for error messages
    const errorMessage = page.locator('[data-amplify-error]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.error('Authentication error:', errorText);
      throw new Error(`Authentication failed: ${errorText}`);
    }
    
    // Wait for authenticated view to load by checking for welcome message
    console.log('Waiting for authenticated view');
    const welcomeMessage = page.getByText(/hello/i);
    await expect(welcomeMessage).toBeVisible({ timeout: 15000 });
    
    // Verify username is shown in welcome message
    const username = await welcomeMessage.textContent();
    console.log('Welcome message:', username);
    expect(username?.toLowerCase()).toContain('hello');
  });

  test('renders authenticated view elements', async ({ page }) => {
    console.log('Testing authenticated view elements');
    
    // Verify action buttons with aria labels
    const signOutButton = page.getByRole('button', { name: 'Sign Out' });
    const deleteAccountButton = page.getByRole('button', { name: 'Delete Account' });
    
    // Check visibility and state
    await expect(signOutButton).toBeVisible({ timeout: 5000 });
    await expect(signOutButton).toBeEnabled();
    await expect(signOutButton).toHaveClass(/bg-red-500/);
    
    await expect(deleteAccountButton).toBeVisible({ timeout: 5000 });
    await expect(deleteAccountButton).toBeEnabled();
    await expect(deleteAccountButton).toHaveClass(/bg-red-700/);
  });

  test('shows delete account confirmation modal', async ({ page }) => {
    console.log('Testing delete account modal');
    
    // Click delete account button
    const deleteAccountButton = page.getByRole('button', { name: 'Delete Account' });
    await expect(deleteAccountButton).toBeVisible({ timeout: 5000 });
    await deleteAccountButton.click();
    
    // Verify modal content
    const modal = page.locator('.fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    // Verify modal elements
    await expect(page.getByRole('heading', { name: 'Delete Account' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/are you sure.*cannot be undone/i)).toBeVisible({ timeout: 5000 });
    
    const confirmButton = page.getByRole('button', { name: 'Confirm' });
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    
    // Verify button visibility and styling
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await expect(confirmButton).toHaveClass(/bg-red-600/);
    
    await expect(cancelButton).toBeVisible({ timeout: 5000 });
    await expect(cancelButton).toHaveClass(/bg-gray-500/);
    
    // Test modal close
    console.log('Testing modal close');
    await cancelButton.click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });
}); 