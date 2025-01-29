import { describe, it, expect, beforeAll } from 'vitest';
import { signIn, updatePassword, signOut } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import './setup';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!@#',
  newPassword: 'NewTest456!@#'
};

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const REGION = process.env.VITE_AWS_REGION;

describe('Backend Auth - Change Password', () => {
  beforeAll(async () => {
    // Create a test user with admin API
    const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

    try {
      // Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        UserAttributes: [
          {
            Name: 'email',
            Value: TEST_USER.email,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          }
        ],
        MessageAction: 'SUPPRESS'
      }));

      // Set password
      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        Password: TEST_USER.password,
        Permanent: true,
      }));

      // Sign in the user
      await signIn({
        username: TEST_USER.email,
        password: TEST_USER.password,
      });
    } catch (error) {
      console.error('Error setting up test user:', error);
      throw error;
    }
  });

  it('should successfully change password and sign in with new password', async () => {
    // Change password
    await updatePassword({
      oldPassword: TEST_USER.password,
      newPassword: TEST_USER.newPassword,
    });

    // Sign out
    await signOut();

    // Try to sign in with new password
    const signInResult = await signIn({
      username: TEST_USER.email,
      password: TEST_USER.newPassword,
    });

    expect(signInResult.isSignedIn).toBe(true);
  });

  it('should fail to change password with incorrect old password', async () => {
    await expect(updatePassword({
      oldPassword: 'wrongpassword',
      newPassword: 'AnotherNew123!@#',
    })).rejects.toThrow();
  });

  it('should fail to change password with invalid new password', async () => {
    await expect(updatePassword({
      oldPassword: TEST_USER.newPassword,
      newPassword: 'weak', // Too short and missing required characters
    })).rejects.toThrow();
  });
}); 