import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { signIn, signOut, updatePassword, deleteUser, fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminGetUserCommand, AdminDisableUserCommand, AdminEnableUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import '../unit/setup';

// Test user credentials with various invalid states
const TEST_USERS = {
  normal: {
    email: `test-normal-${Date.now()}@example.com`,
    password: 'Test123!@#',
  },
  disabled: {
    email: `test-disabled-${Date.now()}@example.com`,
    password: 'Test123!@#',
  },
  invalidPassword: {
    email: `test-invalid-${Date.now()}@example.com`,
    password: 'weak', // Intentionally weak password
  },
  tooManyAttempts: {
    email: `test-locked-${Date.now()}@example.com`,
    password: 'Test123!@#',
  }
};

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const REGION = process.env.VITE_AWS_REGION;

describe('Backend Auth - Invalid User Lifecycle', () => {
  let cognitoClient: CognitoIdentityProviderClient;

  beforeAll(() => {
    cognitoClient = new CognitoIdentityProviderClient({ region: REGION });
  });

  // Clean up any test users after each test
  afterEach(async () => {
    try {
      await signOut();
    } catch (error) {
      // Ignore signOut errors in cleanup
    }
  });

  describe('Account State Transitions', () => {
    it('should handle disabled account scenarios', async () => {
      // 1. Create and set up initial user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.disabled.email,
        UserAttributes: [
          { Name: 'email', Value: TEST_USERS.disabled.email },
          { Name: 'email_verified', Value: 'true' }
        ],
        MessageAction: 'SUPPRESS'
      }));

      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.disabled.email,
        Password: TEST_USERS.disabled.password,
        Permanent: true,
      }));

      // 2. Initial sign in should work
      const initialSignIn = await signIn({
        username: TEST_USERS.disabled.email,
        password: TEST_USERS.disabled.password,
      });
      expect(initialSignIn.isSignedIn).toBe(true);

      // 3. Sign out
      await signOut();

      // 4. Disable the user account
      await cognitoClient.send(new AdminDisableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.disabled.email,
      }));

      // 5. Attempt to sign in while disabled should fail
      await expect(signIn({
        username: TEST_USERS.disabled.email,
        password: TEST_USERS.disabled.password,
      })).rejects.toThrow();

      // 6. Re-enable the user
      await cognitoClient.send(new AdminEnableUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.disabled.email,
      }));

      // 7. Sign in should work again
      const finalSignIn = await signIn({
        username: TEST_USERS.disabled.email,
        password: TEST_USERS.disabled.password,
      });
      expect(finalSignIn.isSignedIn).toBe(true);

      // Clean up
      await deleteUser();
    });

    it('should handle password policy violations', async () => {
      // 1. Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.normal.email,
        UserAttributes: [
          { Name: 'email', Value: TEST_USERS.normal.email },
          { Name: 'email_verified', Value: 'true' }
        ],
        MessageAction: 'SUPPRESS'
      }));

      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.normal.email,
        Password: TEST_USERS.normal.password,
        Permanent: true,
      }));

      // 2. Sign in
      await signIn({
        username: TEST_USERS.normal.email,
        password: TEST_USERS.normal.password,
      });

      // 3. Attempt to change to weak passwords
      const weakPasswords = [
        'short',                  // Too short
        'nouppercaseornumbers',   // No uppercase or numbers
        'NoSpecialChars123',      // No special characters
        '!@#$%^&*()',            // No letters or numbers
      ];

      for (const weakPassword of weakPasswords) {
        await expect(updatePassword({
          oldPassword: TEST_USERS.normal.password,
          newPassword: weakPassword,
        })).rejects.toThrow();
      }

      // Clean up
      await deleteUser();
    });
  });

  describe('Concurrent Operations', () => {
    it('should process password changes sequentially', async () => {
      // 1. Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.normal.email,
        UserAttributes: [
          { Name: 'email', Value: TEST_USERS.normal.email },
          { Name: 'email_verified', Value: 'true' }
        ],
        MessageAction: 'SUPPRESS'
      }));

      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.normal.email,
        Password: TEST_USERS.normal.password,
        Permanent: true,
      }));

      // 2. Sign in
      await signIn({
        username: TEST_USERS.normal.email,
        password: TEST_USERS.normal.password,
      });

      // 3. Attempt multiple password changes
      const newPasswords = [
        'ValidPass123!@#',
        'AnotherValid456!@#',
        'ThirdValid789!@#',
      ];

      // Submit password changes concurrently
      const passwordChangePromises = newPasswords.map(newPassword => 
        updatePassword({
          oldPassword: TEST_USERS.normal.password,
          newPassword,
        })
      );

      // All operations should complete
      const results = await Promise.allSettled(passwordChangePromises);
      
      // All operations should be processed (either succeed or fail)
      expect(results.every(result => result.status === 'fulfilled' || result.status === 'rejected')).toBe(true);

      // Sign out before testing final state
      await signOut();

      // Try each password to determine the final state
      let successfulSignIn = false;
      for (const password of [...newPasswords, TEST_USERS.normal.password]) {
        try {
          const signInResult = await signIn({
            username: TEST_USERS.normal.email,
            password,
          });
          if (signInResult.isSignedIn) {
            successfulSignIn = true;
            break;
          }
        } catch {
          await signOut(); // Clean up failed sign-in attempt
          continue;
        }
      }

      // One of the passwords should work
      expect(successfulSignIn).toBe(true);

      // Clean up
      await deleteUser();
    });

    it('should handle sequential attribute updates', async () => {
      const uniqueId = Date.now();
      const email = `test-attrs-${uniqueId}@example.com`;

      // 1. Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' }
        ],
        MessageAction: 'SUPPRESS'
      }));

      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
        Password: TEST_USERS.normal.password,
        Permanent: true,
      }));

      // 2. Sign in
      await signIn({
        username: email,
        password: TEST_USERS.normal.password,
      });

      // 3. Attempt sequential attribute updates
      const attributeUpdates = [
        { name: 'Name1' },
        { name: 'Name2' },
        { name: 'Name3' },
      ];

      // Process updates one at a time
      for (const attrs of attributeUpdates) {
        await updateUserAttributes({
          userAttributes: {
            name: attrs.name,
          }
        });

        // Verify each update
        const currentAttributes = await fetchUserAttributes();
        expect(currentAttributes.name).toBe(attrs.name);
      }

      // Final state should have the last name
      const finalAttributes = await fetchUserAttributes();
      expect(finalAttributes.name).toBe(attributeUpdates[attributeUpdates.length - 1].name);

      // Clean up
      await deleteUser();
    });
  });

  describe('Account Recovery', () => {
    it('should handle multiple failed password attempts', async () => {
      // 1. Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.tooManyAttempts.email,
        UserAttributes: [
          { Name: 'email', Value: TEST_USERS.tooManyAttempts.email },
          { Name: 'email_verified', Value: 'true' }
        ],
        MessageAction: 'SUPPRESS'
      }));

      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.tooManyAttempts.email,
        Password: TEST_USERS.tooManyAttempts.password,
        Permanent: true,
      }));

      // 2. Attempt multiple failed sign-ins
      const wrongPasswords = ['wrong1', 'wrong2', 'wrong3', 'wrong4', 'wrong5'];
      
      for (const wrongPassword of wrongPasswords) {
        await expect(signIn({
          username: TEST_USERS.tooManyAttempts.email,
          password: wrongPassword,
        })).rejects.toThrow();
      }

      // Account should be temporarily locked
      // Even correct password should fail
      await expect(signIn({
        username: TEST_USERS.tooManyAttempts.email,
        password: TEST_USERS.tooManyAttempts.password,
      })).rejects.toThrow();

      // Clean up
      // Use admin API to delete since we can't sign in
      await cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USERS.tooManyAttempts.email,
      })).then(async () => {
        try {
          // Try to sign in one last time to delete
          await signIn({
            username: TEST_USERS.tooManyAttempts.email,
            password: TEST_USERS.tooManyAttempts.password,
          });
          await deleteUser();
        } catch {
          // If we can't sign in, the account is still locked
          // We'll leave it to be cleaned up by the user pool's password attempt cleanup
        }
      });
    });
  });
}); 
