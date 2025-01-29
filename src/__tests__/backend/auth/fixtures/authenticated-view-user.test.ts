import { describe, it, expect, beforeAll } from 'vitest';
import { signIn, signOut, deleteUser } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import '../unit/setup';

// Test user credentials for authenticated view tests
export const AUTH_VIEW_TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test-auth-view@example.com',
  password: process.env.TEST_USER_PASSWORD || 'AuthView123!@#',
  name: 'Auth View Test User'
};

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const REGION = process.env.VITE_AWS_REGION;

describe('Backend Auth - Authenticated View Test User', () => {
  let cognitoClient: CognitoIdentityProviderClient;

  beforeAll(() => {
    cognitoClient = new CognitoIdentityProviderClient({ region: REGION });
  });

  it('should ensure authenticated view test user exists', async () => {
    try {
      // First try to get the user
      await cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: AUTH_VIEW_TEST_USER.email,
      }));

      // User exists, try to sign in to verify credentials
      try {
        await signIn({
          username: AUTH_VIEW_TEST_USER.email,
          password: AUTH_VIEW_TEST_USER.password,
        });
        await signOut();
        console.log('Authenticated view test user exists and credentials are valid');
      } catch (signInError) {
        console.log('User exists but credentials invalid, recreating user...');
        try {
          // Try to sign in one last time to delete if possible
          await signIn({
            username: AUTH_VIEW_TEST_USER.email,
            password: AUTH_VIEW_TEST_USER.password,
          });
          await deleteUser();
        } catch {
          // Ignore errors, we'll recreate the user anyway
        }
        throw new Error('Recreate user');
      }
    } catch (error) {
      // User doesn't exist or needs recreation, create new user
      console.log('Creating new authenticated view test user...');
      
      // Create user with admin API
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: AUTH_VIEW_TEST_USER.email,
        UserAttributes: [
          { Name: 'email', Value: AUTH_VIEW_TEST_USER.email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'name', Value: AUTH_VIEW_TEST_USER.name }
        ],
        MessageAction: 'SUPPRESS'
      }));

      // Set password
      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: AUTH_VIEW_TEST_USER.email,
        Password: AUTH_VIEW_TEST_USER.password,
        Permanent: true,
      }));

      // Verify we can sign in
      const signInResult = await signIn({
        username: AUTH_VIEW_TEST_USER.email,
        password: AUTH_VIEW_TEST_USER.password,
      });
      expect(signInResult.isSignedIn).toBe(true);

      // Sign out to leave clean state
      await signOut();
    }

    // Final verification that user exists
    const userInfo = await cognitoClient.send(new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: AUTH_VIEW_TEST_USER.email,
    }));
    const emailAttribute = userInfo.UserAttributes?.find(attr => attr.Name === 'email');
    expect(emailAttribute?.Value).toBe(AUTH_VIEW_TEST_USER.email);
  });
}); 