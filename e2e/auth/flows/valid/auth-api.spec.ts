import { test, expect } from '@playwright/test';
import { Amplify } from 'aws-amplify';
import { signIn, signUp, signOut, getCurrentUser, updatePassword, deleteUser, fetchUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fromEnv } from '@aws-sdk/credential-providers';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

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

  test('should handle complete auth lifecycle via Amplify API', async () => {
    // Try to sign in first to check if user exists
    try {
      await signIn({
        username: testUser.email,
        password: testUser.password
      });
      // If we get here, user exists and is confirmed
      console.log('Test user already exists, skipping sign-up step');
      // Sign out before continuing test
      await signOut();
    } catch (error) {
      // Only attempt sign-up if user doesn't exist
      if (error.message.includes('Incorrect username or password')) {
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

        // 2. Auto-confirm user with admin API
        await cognitoClient.send(new AdminConfirmSignUpCommand({
          UserPoolId: process.env.VITE_USER_POOL_ID,
          Username: testUser.email
        }));
      } else {
        throw error;
      }
    }

    // Continue with rest of test...
    // 3. Sign In
    const signInResult = await signIn({
      username: testUser.email,
      password: testUser.password
    });
    expect(signInResult.nextStep.signInStep).toBe('DONE');

    // 4. Get Current User
    const currentUser = await getCurrentUser();
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

    // 9. Verify Account Deleted - Should Not Be Able to Sign In
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

  test('should handle invalid credentials', async () => {
    try {
      await signIn({
        username: 'invalid-email',
        password: testUser.password
      });
      throw new Error('Should not allow invalid email format');
    } catch (error) {
      expect(error.message).toContain('Incorrect username or password');
    }

    try {
      await signIn({
        username: testUser.email,
        password: 'weak'
      });
      throw new Error('Should not allow weak password');
    } catch (error) {
      expect(error.message).toContain('Incorrect username or password');
    }

    try {
      await signIn({
        username: 'nonexistent@example.com',
        password: testUser.password
      });
      throw new Error('Should not allow sign in with non-existent user');
    } catch (error) {
      expect(error.message).toContain('Incorrect username or password');
    }
  });

  test('should handle unauthorized access', async () => {
    try {
      await getCurrentUser();
      throw new Error('Should not allow access without sign in');
    } catch (error) {
      expect(error.message).toContain('User needs to be authenticated');
    }
  });
}); 