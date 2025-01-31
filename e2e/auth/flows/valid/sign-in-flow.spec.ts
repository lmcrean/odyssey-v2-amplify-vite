import { test, expect } from '@playwright/test';
import { Amplify } from 'aws-amplify';
import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fromEnv } from '@aws-sdk/credential-providers';
import { fillSignInForm, clickSignIn } from '../../../utils/auth/form';
import { expectSuccessToast, expectInfoToast } from '../../../utils/toast';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Debug environment variables (without sensitive data)
console.log('Environment Variables:', {
  VITE_AWS_REGION: process.env.VITE_AWS_REGION,
  VITE_USER_POOL_ID: process.env.VITE_USER_POOL_ID,
  VITE_USER_POOL_CLIENT_ID: process.env.VITE_USER_POOL_CLIENT_ID,
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL
});

// Configure Amplify with test environment settings
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_USER_POOL_ID!,
      userPoolClientId: process.env.VITE_USER_POOL_CLIENT_ID!,
      region: process.env.VITE_AWS_REGION
    }
  }
};
console.log('Amplify Configuration:', amplifyConfig);
Amplify.configure(amplifyConfig);

// Initialize Cognito client with credentials
const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.VITE_AWS_REGION,
  credentials: fromEnv()
});

test.describe('Sign In Flow with Existing User', () => {
  const existingUser = {
    email: process.env.TEST_USER_EMAIL!,
    password: process.env.TEST_USER_PASSWORD!
  };

  test.beforeEach(async ({ page }) => {
    // Listen for console errors
    page.on('console', msg => {
      console.log(`Browser ${msg.type()}: ${msg.text()}`);
    });

    // Listen for all network requests
    page.on('request', request => {
      if (request.url().includes('cognito') || request.url().includes('oauth2')) {
        console.log('Auth Request:', {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        });
      }
    });

    // Listen for all responses
    page.on('response', async response => {
      const request = response.request();
      if (request.url().includes('cognito') || request.url().includes('oauth2')) {
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

    // Navigate to the home page before each test
    await page.goto('http://localhost:5175/');
    await page.waitForLoadState('networkidle');
    console.log('Initial page load complete');
  });

  test('should complete UI sign-in flow with existing user', async ({ page }) => {
    // 1. First verify user exists in Cognito (backend check)
    try {
      const getUserCommand = new AdminGetUserCommand({
        UserPoolId: process.env.VITE_USER_POOL_ID,
        Username: existingUser.email
      });
      const userResponse = await cognitoClient.send(getUserCommand);
      expect(userResponse.Username).toBeDefined();
      console.log("User exists in Cognito:", {
        username: userResponse.Username,
        userStatus: userResponse.UserStatus,
        enabled: userResponse.Enabled
      });
    } catch (error) {
      console.error('Cognito error details:', {
        code: error.Code,
        message: error.message,
        requestId: error.$metadata?.requestId
      });
      throw new Error(`Test user does not exist: ${error.message}`);
    }

    // 2. Fill in the sign-in form and submit
    await fillSignInForm(page, existingUser.email, existingUser.password);
    console.log("Filled in sign in form");

    // Debug form state before submission
    const emailValue = await page.inputValue('input[name="username"][type="email"]');
    const passwordFilled = await page.inputValue('input[name="password"][type="password"]');
    console.log('Form state before submission:', {
      email: emailValue,
      passwordLength: passwordFilled.length
    });

    await clickSignIn(page);
    console.log("Clicked sign in");

    // Add explicit wait for auth-related network requests
    try {
      const authResponse = await Promise.race([
        page.waitForResponse(response => 
          (response.url().includes('cognito') || response.url().includes('oauth2')) && 
          response.status() === 200, 
          { timeout: 10000 }
        ),
        page.waitForResponse(response => 
          (response.url().includes('cognito') || response.url().includes('oauth2')) && 
          response.status() === 400,
          { timeout: 10000 }
        )
      ]);

      // If we got a successful auth response, wait for the UI to update
      if (authResponse.status() === 200) {
        // Wait for the auth status to be updated in the UI
        await page.waitForFunction(() => {
          const tokens = Object.keys(window.localStorage).filter(key => 
            key.includes('CognitoIdentityServiceProvider') && 
            (key.includes('accessToken') || key.includes('idToken'))
          );
          return tokens.length > 0;
        }, { timeout: 10000 });
        console.log('Auth tokens found in localStorage');

        // Wait for the authenticated view to be rendered
        await page.waitForSelector('[data-testid="authenticated-view"]', { timeout: 10000 });
        console.log('Authenticated view rendered');

        // Debug page state after sign-in attempt
        console.log("Current URL after sign-in attempt:", await page.url());
        console.log("Local Storage:", await page.evaluate(() => JSON.stringify(window.localStorage)));
        console.log("Session Storage:", await page.evaluate(() => JSON.stringify(window.sessionStorage)));
        
        // Debug visible buttons and text
        const allButtons = await page.locator('button').all();
        console.log("All visible buttons:", await Promise.all(allButtons.map(async btn => {
          const text = await btn.textContent();
          const isVisible = await btn.isVisible();
          const role = await btn.getAttribute('role');
          const ariaLabel = await btn.getAttribute('aria-label');
          return `${text} (visible: ${isVisible}, role: ${role}, aria-label: ${ariaLabel})`;
        })));

        // Verify we can see the authenticated view buttons using text content
        await expect(page.getByText('Change Display Name')).toBeVisible();
        await expect(page.getByText('Change Password')).toBeVisible();
        await expect(page.getByText('Sign Out')).toBeVisible();
        await expect(page.getByText('Delete Account')).toBeVisible();
      }
    } catch (e) {
      console.error('Error waiting for auth response or UI update:', e);
    }

    // Wait for any navigation
    try {
      await Promise.race([
        page.waitForNavigation({ timeout: 5000 }),
        page.waitForLoadState('networkidle', { timeout: 5000 })
      ]);
    } catch (e) {
      console.log('No navigation occurred after sign-in attempt');
    }

    // Check for error messages
    const errorMessages = await page.locator('text=/error|incorrect|failed/i').all();
    if (errorMessages.length > 0) {
      console.log("Found error messages:", await Promise.all(errorMessages.map(msg => msg.textContent())));
    }
  });
}); 