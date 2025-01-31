import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { signIn, signOut, updatePassword, deleteUser, getCurrentUser, fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminGetUserCommand, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import '../unit/setup';

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const REGION = process.env.VITE_AWS_REGION;

describe('Backend Auth - Integration Flow', () => {
  let cognitoClient: CognitoIdentityProviderClient;
  let currentTestUser: { email: string; password: string } | null = null;

  beforeAll(() => {
    cognitoClient = new CognitoIdentityProviderClient({ region: REGION });
  });

  afterEach(async () => {
    // Cleanup: If a test user exists, try to delete it
    if (currentTestUser) {
      try {
        await cognitoClient.send(new AdminDeleteUserCommand({
          UserPoolId: USER_POOL_ID,
          Username: currentTestUser.email
        }));
      } catch (error) {
        // Ignore errors during cleanup
        console.log('Cleanup error (can be ignored):', error);
      }
      currentTestUser = null;
    }
  });

  describe('Complete Auth Flow', () => {
    it('should handle full auth lifecycle: create -> sign in -> update -> change password -> sign out -> sign in -> delete', async () => {
      // Create unique test user for this test
      const TEST_USER = {
        email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
        password: 'Test123!@#',
        newPassword: 'NewTest456!@#',
        name: 'Test User',
        updatedName: 'Updated Test User'
      };
      currentTestUser = { email: TEST_USER.email, password: TEST_USER.password };

      // 1. Create user with admin API
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

      // Set initial password
      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        Password: TEST_USER.password,
        Permanent: true,
      }));

      // 2. Sign in with initial credentials
      const initialSignIn = await signIn({
        username: TEST_USER.email,
        password: TEST_USER.password,
      });
      expect(initialSignIn.isSignedIn).toBe(true);

      // 3. Verify user attributes
      const initialAttributes = await fetchUserAttributes();
      expect(initialAttributes.email).toBe(TEST_USER.email);
      expect(initialAttributes.name).toBe(TEST_USER.name);

      // 4. Update user attributes
      await updateUserAttributes({
        userAttributes: {
          name: TEST_USER.updatedName,
        }
      });

      // Verify update
      const updatedAttributes = await fetchUserAttributes();
      expect(updatedAttributes.name).toBe(TEST_USER.updatedName);

      // 5. Change password
      await updatePassword({
        oldPassword: TEST_USER.password,
        newPassword: TEST_USER.newPassword,
      });

      // 6. Sign out
      await signOut();

      // Verify signed out state
      await expect(getCurrentUser()).rejects.toThrow();

      // 7. Sign in with new password
      const newPasswordSignIn = await signIn({
        username: TEST_USER.email,
        password: TEST_USER.newPassword,
      });
      expect(newPasswordSignIn.isSignedIn).toBe(true);

      // 8. Delete account
      await deleteUser();

      // Verify account deletion
      await expect(cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email
      }))).rejects.toThrow('User does not exist');

      // Verify can't sign in after deletion
      await expect(signIn({
        username: TEST_USER.email,
        password: TEST_USER.newPassword,
      })).rejects.toThrow();
    });
  });

  describe('Error Recovery Flow', () => {
    it('should handle failed operations and recovery', async () => {
      // Create unique test user for this test
      const TEST_USER = {
        email: `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`,
        password: 'Test123!@#',
        newPassword: 'NewTest456!@#'
      };
      currentTestUser = { email: TEST_USER.email, password: TEST_USER.password };

      // 1. Create user
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

      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        Password: TEST_USER.password,
        Permanent: true,
      }));

      // 2. Sign in
      await signIn({
        username: TEST_USER.email,
        password: TEST_USER.password,
      });

      // 3. Test failed password change with incorrect old password
      await expect(updatePassword({
        oldPassword: 'wrongpassword',
        newPassword: TEST_USER.newPassword,
      })).rejects.toThrow();

      // 4. Successfully change password after failure
      await updatePassword({
        oldPassword: TEST_USER.password,
        newPassword: TEST_USER.newPassword,
      });

      // 5. Sign out
      await signOut();

      // 6. Verify old password no longer works
      await expect(signIn({
        username: TEST_USER.email,
        password: TEST_USER.password,
      })).rejects.toThrow();

      // 7. Sign in with new password
      const signInResult = await signIn({
        username: TEST_USER.email,
        password: TEST_USER.newPassword,
      });
      expect(signInResult.isSignedIn).toBe(true);

      // 8. Clean up - delete user
      await deleteUser();
    });
  });
}); 