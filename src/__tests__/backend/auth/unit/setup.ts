import { Amplify } from 'aws-amplify';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Configure Amplify with test environment settings
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_USER_POOL_ID as string,
      userPoolClientId: process.env.VITE_USER_POOL_CLIENT_ID as string
    }
  }
}); 
