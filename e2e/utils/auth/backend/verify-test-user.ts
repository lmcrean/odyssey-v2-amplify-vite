import { AdminConfirmSignUpCommand, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

const COGNITO_REGION = process.env.COGNITO_REGION || 'us-east-1';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

if (!USER_POOL_ID) {
  throw new Error('COGNITO_USER_POOL_ID environment variable is required');
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION
});

export const verifyTestUser = async (email: string) => {
  try {
    const command = new AdminConfirmSignUpCommand({
      UserPoolId: USER_POOL_ID,
      Username: email
    });

    await cognitoClient.send(command);
    console.log(`Successfully verified test user: ${email}`);
  } catch (error) {
    console.error('Failed to verify test user:', error);
    throw error;
  }
}; 