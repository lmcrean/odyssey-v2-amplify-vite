import { Page, expect } from '@playwright/test';

export async function signUp(page: Page, email: string, password: string) {
  try {
    await page.getByRole('tab', { name: /create account/i }).click();
    await page.waitForTimeout(500); // Small delay for tab switch

    await page.getByLabel(/username/i).clear();
    await page.getByLabel(/^password$/i).clear();
    
    await page.getByLabel(/username/i).fill(email);
    await page.getByLabel(/^password$/i).fill(password);
    
    await page.getByRole('button', { name: /sign up/i }).click();

    // Wait for either success or error state
    await Promise.race([
      page.getByText(/account created successfully/i).waitFor({ timeout: 10000 }),
      page.getByText(/error/i).waitFor({ timeout: 10000 })
    ]);

  } catch (error) {
    console.error('Sign up flow failed:', error);
    throw error;
  }
}

export async function signIn(page: Page, email: string, password: string) {
  await page.goto('/');
  await page.getByRole('tab', { name: /sign in/i }).click();
  await page.getByLabel(/username/i).fill(email);
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

export async function signOut(page: Page) {
  await page.getByRole('button', { name: /sign out/i }).click();
}

export async function deleteAccount(page: Page) {
  await page.getByRole('button', { name: /delete account/i }).click();
  await page.getByTestId('confirm-delete-account').click();
} 