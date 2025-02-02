import { CognitoIdentityProviderClient, AdminEnableUserCommand, AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";
import dotenv from 'dotenv';
import path from 'path';

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('Environment variables loaded from:', path.resolve(process.cwd(), '.env'));
console.log('Environment variables loaded:', {
  TEST_USER_EMAIL: process.env.TEST_USER_EMAIL,
  TEST_USER_PASSWORD: process.env.TEST_USER_PASSWORD ? '[REDACTED]' : undefined
});

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const TEST_EMAIL = 'test-delete-account@example.com';

const client = new CognitoIdentityProviderClient({ region: 'eu-west-2' });

async function resetTestUser() {
  console.log('Starting test user reset...');
  console.log(`Resetting test user: ${TEST_EMAIL}`);
  console.log(`User Pool ID: ${USER_POOL_ID}`);

  try {
    // Enable the user first
    console.log('Enabling user...');
    await client.send(new AdminEnableUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: TEST_EMAIL
    }));
    console.log('User enabled successfully');

    // Wait 5 seconds after enabling
    console.log('Waiting 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Set the password using the one from environment variables
    console.log('Setting new password...');
    await client.send(new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: TEST_EMAIL,
      Password: process.env.TEST_USER_PASSWORD,
      Permanent: true
    }));
    console.log('Password reset successfully');

  } catch (error) {
    console.error('Error resetting test user:', error);
    process.exit(1);
  }
}

resetTestUser(); 