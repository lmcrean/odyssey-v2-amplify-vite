import { AdminDeleteUserCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const COGNITO_REGION = process.env.COGNITO_REGION || 'eu-west-2';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

if (!USER_POOL_ID) {
  throw new Error('COGNITO_USER_POOL_ID environment variable is required');
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION
});

export const deleteTestAccount = async (email: string) => {
  try {
    const command = new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email
    });

    await cognitoClient.send(command);
    console.log(`Successfully deleted test user: ${email}`);
  } catch (error) {
    console.error('Failed to delete test user:', error);
    throw error;
  }
};
