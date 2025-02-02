import { test, expect } from '@playwright/test';
import { Amplify } from 'aws-amplify';
import { signIn, signUp, signOut, getCurrentUser, updatePassword, deleteUser, fetchUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminConfirmSignUpCommand, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fromEnv } from '@aws-sdk/credential-providers';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ANSI color codes for console output
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

// Email limit error patterns
const EMAIL_LIMIT_PATTERNS = [
  'Exceeded daily email limit',
  'Daily message quota exceeded',
  'LimitExceededException',
  'Email quota exceeded'
];

// Helper to check if error is related to email limits
const isEmailLimitError = (error: any): boolean => {
  const errorMessage = error?.message || '';
  return EMAIL_LIMIT_PATTERNS.some(pattern => errorMessage.includes(pattern));
};

// Configure Amplify with test environment settings
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_USER_POOL_ID!,
      userPoolClientId: process.env.VITE_USER_POOL_CLIENT_ID!
    }
  }
});

// Initialize Cognito client with credentials
const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.VITE_AWS_REGION!,
  credentials: fromEnv()
});

test.describe('Auth API Backend Tests', () => {
  // Store context between tests
  const testUser = {
    email: process.env.TEST_USER_EMAIL || 'test-delete-account@example.com',
    password: process.env.TEST_USER_PASSWORD || 'Test123!@#',
    newPassword: 'NewTest456!@#'
  };

  // Clean up test user before tests if exists
  test.beforeAll(async () => {
    try {
      await cognitoClient.send(new AdminDeleteUserCommand({
        UserPoolId: process.env.VITE_USER_POOL_ID,
        Username: testUser.email
      }));
    } catch (error) {
      // Ignore if user doesn't exist
      if (!error.message.includes('User does not exist')) {
        console.error('Error during user cleanup:', error);
      }
    }
  });

  test('should handle complete auth lifecycle via Amplify API', async ({ page }) => {
    try {
      // 1. Sign Up
      const signUpResult = await signUp({
        username: testUser.email,
        password: testUser.password,
        options: {
          userAttributes: {
            email: testUser.email
          }
        }
      });
      expect(signUpResult.userId).toBeDefined();
      expect(signUpResult.nextStep.signUpStep).toBe('CONFIRM_SIGN_UP');
    } catch (error) {
      if (isEmailLimitError(error)) {
        console.log(`${YELLOW}⚠️  AWS Email limit reached. Please try running the tests again tomorrow.${RESET}`);
        console.log(`${YELLOW}Error details: ${error.message}${RESET}`);
        test.skip(true, 'Skipping test due to AWS SES email limit - please retry tomorrow');
        return;
      }
      throw error;
    }

    // 2. Auto-confirm user with admin API
    await cognitoClient.send(new AdminConfirmSignUpCommand({
      UserPoolId: process.env.VITE_USER_POOL_ID,
      Username: testUser.email
    }));

    // 3. Sign In
    const signInResult = await signIn({
      username: testUser.email,
      password: testUser.password
    });
    expect(signInResult.nextStep.signInStep).toBe('DONE');

    // 4. Get Current User
    const currentUser = await getCurrentUser();
    expect(currentUser).toBeDefined();
    
    const userAttributes = await fetchUserAttributes();
    expect(userAttributes.email).toBe(testUser.email);

    // 5. Update Password
    await updatePassword({
      oldPassword: testUser.password,
      newPassword: testUser.newPassword
    });

    // 6. Sign Out
    await signOut();

    // 7. Sign In with New Password
    const newSignInResult = await signIn({
      username: testUser.email,
      password: testUser.newPassword
    });
    expect(newSignInResult.nextStep.signInStep).toBe('DONE');

    // 8. Delete Account
    await deleteUser();

    // 9. Verify Account Deleted
    try {
      await signIn({
        username: testUser.email,
        password: testUser.newPassword
      });
      throw new Error('Should not be able to sign in after deletion');
    } catch (error) {
      expect(error.message).toContain('Incorrect username or password');
    }
  });

  test('should handle invalid credentials', async ({ page }) => {
    const testCases = [
      {
        username: 'invalid-email',
        password: testUser.password,
        expectedError: 'Incorrect username or password'
      },
      {
        username: testUser.email,
        password: 'weak',
        expectedError: 'Incorrect username or password'
      },
      {
        username: 'nonexistent@example.com',
        password: testUser.password,
        expectedError: 'Incorrect username or password'
      }
    ];

    for (const testCase of testCases) {
      try {
        await signIn({
          username: testCase.username,
          password: testCase.password
        });
        throw new Error(`Should not allow sign in with ${testCase.username}`);
      } catch (error) {
        expect(error.message).toContain(testCase.expectedError);
      }
    }
  });

  test('should handle unauthorized access', async ({ page }) => {
    try {
      await getCurrentUser();
      throw new Error('Should not allow access without sign in');
    } catch (error) {
      expect(error.message).toContain('User needs to be authenticated');
    }
  });
}); 