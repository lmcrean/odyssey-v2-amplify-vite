import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: {
      verificationEmailSubject: 'Welcome to Odyssey! Verify your email',
      verificationEmailBody: 'Thanks for signing up! Your verification code is {####}',
    },
  },
  userAttributes: {
    profilePicture: {
      mutable: true,
      required: false,
    },
    displayName: {
      mutable: true,
      required: false,
    },
  },
  multifactor: false,
  passwordPolicy: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialCharacters: true,
    requireUppercase: true,
    requireLowercase: true,
  },
});
