import { CognitoIdentityProviderClient, AdminGetUserCommand } from '@aws-sdk/client-cognito-identity-provider';
require('dotenv').config();

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const TEST_EMAIL = 'test-delete-account@example.com';

async function checkTestUser() {
  console.log('Checking test user:', TEST_EMAIL);
  console.log('User Pool ID:', USER_POOL_ID);
  
  const client = new CognitoIdentityProviderClient({ region: 'eu-west-2' });

  try {
    console.log('Sending AdminGetUserCommand...');
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
    console.error('Error checking test user:', error);
    if (error.name === 'UserNotFoundException') {
      console.log('User does not exist');
    }
    process.exit(1);
  }
}

// Add error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

console.log('Starting test user check...');
checkTestUser().catch(error => {
  console.error('Error in checkTestUser:', error);
  process.exit(1);
}); 