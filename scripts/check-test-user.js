import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

const USER_POOL_ID = 'eu-west-2_UMEqZ05VW';
const TEST_EMAIL = process.env.TEST_USER_EMAIL;

async function checkTestUser() {
  const client = new CognitoIdentityProviderClient({ region: 'eu-west-2' });

  try {
    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: TEST_EMAIL,
    });

    const response = await client.send(command);
    console.log('User exists in Cognito');
    console.log('User status:', response.UserStatus);
    console.log('User attributes:', response.UserAttributes);
    console.log('User enabled:', response.Enabled);
  } catch (error) {
    console.error('Error checking test user:', error.message);
    process.exit(1);
  }
}

checkTestUser(); 