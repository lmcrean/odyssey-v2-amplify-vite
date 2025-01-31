import { test, expect } from '@playwright/test';
import { Amplify } from 'aws-amplify';
import { signIn, signUp, signOut } from 'aws-amplify/auth';
import { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { fromEnv } from '@aws-sdk/credential-providers';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configure Amplify with test environment settings
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_USER_POOL_ID!,
      userPoolClientId: process.env.VITE_USER_POOL_CLIENT_ID!
    }
  }
});

// Initialize Cognito client with credentials
const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.VITE_AWS_REGION!,
  credentials: fromEnv()
});

test.describe('Create Persistent Test User', () => {
  const testUser = {
    email: 'persistent-test-user@example.com',
    password: 'Test123!@#'
  };

  test('should create and verify test user account', async () => {
    // ... rest of the test code ...
  });
}); 