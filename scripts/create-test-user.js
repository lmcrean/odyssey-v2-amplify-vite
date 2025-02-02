import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminSetUserPasswordCommand } from "@aws-sdk/client-cognito-identity-provider";

const USER_POOL_ID = 'eu-west-2_HIelfjWHp';
const TEST_EMAIL = 'test-delete-account@example.com';
const TEST_PASSWORD = 'dcd0c6a4dbfc9b93823fb55398b5580eAa1!';

async function createTestUser() {
  const client = new CognitoIdentityProviderClient({ region: 'eu-west-2' });

  try {
    // Create user
    await client.send(new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: TEST_EMAIL,
      UserAttributes: [
        {
          Name: 'email',
          Value: TEST_EMAIL,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
      MessageAction: 'SUPPRESS', // Don't send welcome email
    }));

    console.log('User created successfully');

    // Set permanent password
    await client.send(new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: TEST_EMAIL,
      Password: TEST_PASSWORD,
      Permanent: true,
    }));

    console.log('Password set successfully');
    console.log('Test user created and ready for e2e tests');
  } catch (error) {
    if (error.name === 'UsernameExistsException') {
      console.log('Test user already exists');
    } else {
      console.error('Error creating test user:', error);
      process.exit(1);
    }
  }
}

createTestUser(); 