import { test, expect } from '@playwright/test';
import { fillSignInForm } from '../../../../utils/auth/form/fill-sign-in';
import { expectErrorToast } from '../../../../utils/toast/error';

test.describe('Invalid Sign In - Malformed Email', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure page is fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Wait for the Amplify authenticator to be visible
    await page.waitForSelector('[data-amplify-authenticator]', { timeout: 10000 });
  });

  test('shows error for malformed email', async ({ page }) => {
    test.slow();
    
    // Listen for all network requests for debugging
    page.on('request', request => {
      if (request.url().includes('cognito')) {
        console.log('Auth Request:', {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });

    // Listen for all responses for debugging
    page.on('response', async response => {
      const request = response.request();
      if (request.url().includes('cognito')) {
        try {
          const responseBody = await response.text();
          console.log('Auth Response:', {
            url: request.url(),
            status: response.status(),
            statusText: response.statusText(),
            body: responseBody
          });
        } catch (e) {
          console.error('Could not get auth response body:', e);
        }
      }
    });
    
    // Intercept Cognito API calls
    await page.route('**/*cognito-idp*.amazonaws.com/**', async (route) => {
      const request = route.request();
      const postData = request.postData();
      
      console.log('Intercepted request:', {
        url: request.url(),
        postData
      });
      
      if (postData && postData.includes('InitiateAuth')) {
        console.log('Mocking InitiateAuth response');
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            __type: 'InvalidEmailFormatException',
            message: 'Invalid email format'
          })
        });
        return;
      }
      
      console.log('Continuing with request');
      await route.continue();
    });
    
    // Fill in the form
    await fillSignInForm(page, 'not-an-email', 'Test123!@#');

    // Wait for the error toast
    await page.waitForSelector('.Toastify__toast--error', { timeout: 10000 });
    await expectErrorToast(page, 'Invalid email format', 10000);
  });
}); 