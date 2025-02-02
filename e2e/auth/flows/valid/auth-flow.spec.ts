import { test, expect } from '@playwright/test';
import { Amplify } from 'aws-amplify';
import { CognitoIdentityProviderClient, AdminGetUserCommand, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fromEnv } from '@aws-sdk/credential-providers';
import { fillSignInForm, clickSignIn } from '../../../utils/auth/form';
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

test.describe('Sign In and Sign Out Flow with Existing User', () => {
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

  test('should complete UI sign-in and sign-out flow with existing user', async ({ page }) => {
    // 1. First create test user if it doesn't exist
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
      if (error.message.includes('User does not exist')) {
        console.log('Test user does not exist, creating new user...');
        
        // Create user with AdminCreateUser (no email sent)
        await cognitoClient.send(new AdminCreateUserCommand({
          UserPoolId: process.env.VITE_USER_POOL_ID,
          Username: existingUser.email,
          UserAttributes: [
            {
              Name: 'email',
              Value: existingUser.email
            },
            {
              Name: 'email_verified',
              Value: 'true'
            }
          ],
          MessageAction: 'SUPPRESS'
        }));

        // Set permanent password
        await cognitoClient.send(new AdminSetUserPasswordCommand({
          UserPoolId: process.env.VITE_USER_POOL_ID,
          Username: existingUser.email,
          Password: existingUser.password,
          Permanent: true
        }));

        console.log('Created new test user with AdminCreateUser');
      } else {
        throw error;
      }
    }

    // 2. Fill in the sign-in form and submit
    await page.waitForSelector('[data-amplify-authenticator]', { timeout: 10000 });
    console.log("Amplify Authenticator rendered");

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

        // Add a small delay to allow the Amplify Authenticator to update its internal state
        await page.waitForTimeout(2000);

        // Debug the DOM state before looking for the button
        console.log("DOM state before looking for button:", await page.evaluate(() => document.body.innerHTML));

        // Debug all buttons with their properties
        const buttons = await page.locator('button').all();
        for (const button of buttons) {
          const text = await button.textContent();
          const ariaLabel = await button.getAttribute('aria-label');
          const isVisible = await button.isVisible();
          console.log('Button found:', { text, ariaLabel, isVisible });
        }

        // Wait for the Change Display Name button to be visible (indicates authenticated view is rendered)
        await page.waitForSelector('button[aria-label="Change Display Name"]', { timeout: 10000 });
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

        // 3. Now test the sign-out flow
        console.log("Starting sign-out flow");
        
        // Click the sign-out button
        const signOutButton = page.getByRole('button', { name: 'Sign Out' });
        await expect(signOutButton).toBeVisible();
        await signOutButton.click();
        console.log("Clicked sign out button");

        // Debug the DOM state immediately after clicking sign out
        console.log("DOM state after sign out click:", await page.evaluate(() => document.body.innerHTML));

        // Wait for auth tokens to be cleared from localStorage first
        await page.waitForFunction(() => {
          const tokens = Object.keys(window.localStorage).filter(key => 
            key.includes('CognitoIdentityServiceProvider') && 
            (key.includes('accessToken') || key.includes('idToken'))
          );
          console.log("Current localStorage tokens:", tokens);
          return tokens.length === 0;
        }, { timeout: 20000 });
        console.log("Auth tokens cleared from localStorage");

        // Debug the DOM state after localStorage is cleared
        console.log("DOM state after localStorage cleared:", await page.evaluate(() => document.body.innerHTML));

        // Wait for sign-out to complete and sign-in form to be visible
        await page.waitForSelector('[data-amplify-authenticator-signin]', { timeout: 20000 });
        console.log('Sign-in form found after sign-out');

        // Verify sign-in form elements are visible
        await page.waitForSelector('input[name="username"]', { timeout: 20000 });
        await page.waitForSelector('input[name="password"]', { timeout: 20000 });
        await page.waitForSelector('button[type="submit"]', { timeout: 20000 });
        console.log('All sign-in form elements are visible');

        // Verify local storage is cleared of auth tokens
        const localStorageAfterSignOut = await page.evaluate(() => window.localStorage);
        const authTokensExist = Object.keys(localStorageAfterSignOut).some(key => 
          key.includes('CognitoIdentityServiceProvider') && 
          (key.includes('accessToken') || key.includes('idToken'))
        );
        expect(authTokensExist).toBeFalsy();
        console.log("Verified auth tokens are cleared from localStorage");
      }
    } catch (e) {
      console.error('Error during sign-in/sign-out flow:', e);
      throw e;
    }
  });
}); 