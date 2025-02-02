import { describe, it, expect, beforeAll } from 'vitest';
import { signIn, signOut, updatePassword, deleteUser, fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import '../unit/setup';

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const REGION = process.env.VITE_AWS_REGION;

// Helper function to create unique test user
const createTestUser = () => ({
  email: `test-${Date.now()}-${Math.random().toString(36).substring(2)}@example.com`,
  password: 'Test123!@#',
  newPassword: 'NewTest456!@#',
  name: 'Test User',
  updatedName: 'Updated Test User'
});

describe('Backend Auth - Stress Tests', () => {
  let cognitoClient: CognitoIdentityProviderClient;

  beforeAll(() => {
    cognitoClient = new CognitoIdentityProviderClient({ region: REGION });
  });

  describe('Rapid Operation Sequences', () => {
    it('should handle rapid attribute updates', async () => {
      const TEST_USER = createTestUser();
      // 1. Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        UserAttributes: [
          { Name: 'email', Value: TEST_USER.email },
          { Name: 'email_verified', Value: 'true' }
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

      // 3. Perform rapid attribute updates
      const updates = Array.from({ length: 5 }, (_, i) => ({
        userAttributes: {
          name: `Test User ${i + 1}`
        }
      }));

      // Execute updates with minimal delay
      const results = await Promise.allSettled(
        updates.map(update => updateUserAttributes(update))
      );
      
      // Verify at least some operations succeeded
      expect(results.some(result => result.status === 'fulfilled')).toBe(true);

      // Verify final state
      const finalAttributes = await fetchUserAttributes();
      expect(finalAttributes.name).toBeDefined();

      // Clean up
      await deleteUser();
    });

    it('should handle rapid password changes', async () => {
      const TEST_USER = createTestUser();
      // 1. Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        UserAttributes: [
          { Name: 'email', Value: TEST_USER.email },
          { Name: 'email_verified', Value: 'true' }
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

      // 3. Attempt rapid password changes
      const passwords = Array.from({ length: 5 }, (_, i) => `NewPass${i + 1}!@#`);
      
      // Execute password changes with minimal delay
      const results = await Promise.allSettled(
        passwords.map(newPassword => 
          updatePassword({
            oldPassword: TEST_USER.password,
            newPassword,
          })
        )
      );
      
      // Verify at least some operations succeeded
      expect(results.some(result => result.status === 'fulfilled')).toBe(true);

      // Sign out to test final password
      await signOut();

      // Try each password to determine which one worked
      let finalPasswordFound = false;
      for (const password of [...passwords, TEST_USER.password]) {
        try {
          const signInResult = await signIn({
            username: TEST_USER.email,
            password,
          });
          if (signInResult.isSignedIn) {
            finalPasswordFound = true;
            break;
          }
        } catch {
          await signOut();
          continue;
        }
      }

      expect(finalPasswordFound).toBe(true);

      // Clean up
      await deleteUser();
    });
  });

  describe('Mixed Operation Sequences', () => {
    it('should handle interleaved operations', async () => {
      const TEST_USER = createTestUser();
      const uniqueId = Date.now();
      const email = `test-mixed-${uniqueId}@example.com`;

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
        Password: TEST_USER.password,
        Permanent: true,
      }));

      // 2. Sign in
      await signIn({
        username: email,
        password: TEST_USER.password,
      });

      // 3. Perform mixed operations in rapid succession
      const operations = [
        () => updateUserAttributes({ userAttributes: { name: 'Name 1' } }),
        () => updatePassword({ oldPassword: TEST_USER.password, newPassword: 'NewPass1!@#' }),
        () => updateUserAttributes({ userAttributes: { name: 'Name 2' } }),
        () => signOut(),
        () => signIn({ username: email, password: 'NewPass1!@#' }),
        () => updateUserAttributes({ userAttributes: { name: 'Name 3' } }),
      ];

      // Execute operations in sequence but rapidly
      for (const operation of operations) {
        await operation().catch(() => {
          // Ignore errors as some operations might fail due to state transitions
        });
      }

      // Verify final state
      const userExists = await cognitoClient.send(new AdminGetUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,
      })).catch(() => false);

      expect(userExists).not.toBe(false);

      // Clean up
      await deleteUser();
    });

    it('should handle concurrent sign-in attempts', async () => {
      const TEST_USER = createTestUser();
      // 1. Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        UserAttributes: [
          { Name: 'email', Value: TEST_USER.email },
          { Name: 'email_verified', Value: 'true' }
        ],
        MessageAction: 'SUPPRESS'
      }));

      await cognitoClient.send(new AdminSetUserPasswordCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        Password: TEST_USER.password,
        Permanent: true,
      }));

      // 2. Attempt multiple concurrent sign-ins
      const signInAttempts = Array.from({ length: 5 }, () => 
        signIn({
          username: TEST_USER.email,
          password: TEST_USER.password,
        })
      );

      const results = await Promise.allSettled(signInAttempts);
      
      // At least one sign-in should succeed
      expect(results.some(result => result.status === 'fulfilled')).toBe(true);

      // Clean up
      await deleteUser();
    });
  });

  describe('Recovery Scenarios', () => {
    it('should handle operation retry after failures', async () => {
      const TEST_USER = createTestUser();
      // 1. Create user
      await cognitoClient.send(new AdminCreateUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: TEST_USER.email,
        UserAttributes: [
          { Name: 'email', Value: TEST_USER.email },
          { Name: 'email_verified', Value: 'true' }
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

      // 3. Attempt operations with retries
      const maxRetries = 3;
      let retryCount = 0;
      let success = false;

      while (retryCount < maxRetries && !success) {
        try {
          await updatePassword({
            oldPassword: TEST_USER.password,
            newPassword: TEST_USER.newPassword,
          });
          success = true;
        } catch {
          retryCount++;
          // Add small delay between retries
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      expect(success).toBe(true);

      // Clean up
      await deleteUser();
    });
  });
}); 