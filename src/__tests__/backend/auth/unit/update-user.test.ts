import { describe, it, expect, beforeAll } from 'vitest';
import { signIn, updateUserAttributes, fetchUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from '@aws-sdk/client-cognito-identity-provider';
import './setup';

// Test user credentials
const TEST_USER = {
  email: `test-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`,
  password: 'Test123!@#',
  name: 'Test User',
  updatedName: 'Updated Test User'
};

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const REGION = process.env.VITE_AWS_REGION;

describe('Backend Auth - Update User', () => {
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
          },
          {
            Name: 'name',
            Value: TEST_USER.name,
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

  it('should successfully update user name', async () => {
    // Update the user's name
    await updateUserAttributes({
      userAttributes: {
        name: TEST_USER.updatedName,
      }
    });

    // Verify the update
    const attributes = await fetchUserAttributes();
    expect(attributes.name).toBe(TEST_USER.updatedName);
  });

  it('should fail to update with invalid attribute', async () => {
    // Try to update with an invalid attribute
    await expect(updateUserAttributes({
      userAttributes: {
        'invalid_attribute': 'some value',
      }
    })).rejects.toThrow();
  });
}); 