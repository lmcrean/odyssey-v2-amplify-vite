import { describe, it, expect, beforeAll } from 'vitest';
import { signIn, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import './setup';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'Test123!@#'
};

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const REGION = process.env.VITE_AWS_REGION;

describe('Backend Auth - Get User', () => {
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

  it('should successfully get current user details', async () => {
    // Get user and their attributes
    const user = await getCurrentUser();
    const attributes = await fetchUserAttributes();
    
    expect(user).toBeDefined();
    expect(attributes.email).toBe(TEST_USER.email);
  });
}); 
