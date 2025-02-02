import { CognitoIdentityProviderClient, AdminDeleteUserCommand } from '@aws-sdk/client-cognito-identity-provider';
require('dotenv').config();

const USER_POOL_ID = process.env.VITE_USER_POOL_ID;
const TEST_EMAIL = 'test-delete-account@example.com';

async function deleteTestUser() {
  console.log('Deleting test user:', TEST_EMAIL);
  console.log('User Pool ID:', USER_POOL_ID);
  
  const client = new CognitoIdentityProviderClient({ region: 'eu-west-2' });

  try {
    console.log('Sending AdminDeleteUserCommand...');
    const command = new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: TEST_EMAIL,
    });

    await client.send(command);
    console.log('User deleted successfully');
  } catch (error) {
    console.error('Error deleting test user:', error);
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

console.log('Starting test user deletion...');
deleteTestUser().catch(error => {
  console.error('Error in deleteTestUser:', error);
  process.exit(1);
}); 