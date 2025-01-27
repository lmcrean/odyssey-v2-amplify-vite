import { test, expect } from '@playwright/test';
import { expectSuccessToast, expectErrorToast, expectInfoToast } from '../utils/toast';

test.describe('Toast Utilities', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Add toast container to the page
    await page.evaluate(() => {
      const toastContainer = document.createElement('div');
      toastContainer.className = 'Toastify';
      document.body.appendChild(toastContainer);
    });
  });

  test('expectSuccessToast verifies success toast visibility and message', async ({ page }) => {
    const testMessage = 'Operation successful!';
    
    // Add a success toast to the page
    await page.evaluate((message) => {
      const toast = document.createElement('div');
      toast.className = 'Toastify__toast Toastify__toast--success';
      toast.textContent = message;
      document.querySelector('.Toastify').appendChild(toast);
    }, testMessage);

    // Verify the toast
    await expectSuccessToast(page, testMessage);
  });

  test('expectErrorToast verifies error toast visibility and message', async ({ page }) => {
    const testMessage = 'Operation failed!';
    
    // Add an error toast to the page
    await page.evaluate((message) => {
      const toast = document.createElement('div');
      toast.className = 'Toastify__toast Toastify__toast--error';
      toast.textContent = message;
      document.querySelector('.Toastify').appendChild(toast);
    }, testMessage);

    // Verify the toast
    await expectErrorToast(page, testMessage);
  });

  test('expectInfoToast verifies info toast visibility and message', async ({ page }) => {
    const testMessage = 'Operation in progress...';
    
    // Add an info toast to the page
    await page.evaluate((message) => {
      const toast = document.createElement('div');
      toast.className = 'Toastify__toast Toastify__toast--info';
      toast.textContent = message;
      document.querySelector('.Toastify').appendChild(toast);
    }, testMessage);

    // Verify the toast
    await expectInfoToast(page, testMessage);
  });

  test('toast utilities fail when toast is not visible', async ({ page }) => {
    const testMessage = 'Test message';
    
    // Try to verify non-existent toasts
    await expect(expectSuccessToast(page, testMessage)).rejects.toThrow();
    await expect(expectErrorToast(page, testMessage)).rejects.toThrow();
    await expect(expectInfoToast(page, testMessage)).rejects.toThrow();
  });

  test('toast utilities fail when message does not match', async ({ page }) => {
    const actualMessage = 'Actual message';
    const expectedMessage = 'Expected message';
    
    // Add toasts with different messages
    await page.evaluate((message) => {
      ['success', 'error', 'info'].forEach(type => {
        const toast = document.createElement('div');
        toast.className = `Toastify__toast Toastify__toast--${type}`;
        toast.textContent = message;
        document.querySelector('.Toastify').appendChild(toast);
      });
    }, actualMessage);

    // Verify that the utilities fail when messages don't match
    await expect(expectSuccessToast(page, expectedMessage)).rejects.toThrow();
    await expect(expectErrorToast(page, expectedMessage)).rejects.toThrow();
    await expect(expectInfoToast(page, expectedMessage)).rejects.toThrow();
  });
}); 