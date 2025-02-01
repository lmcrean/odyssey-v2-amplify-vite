import { defineAuth } from '@aws-amplify/backend';

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  name: 'odyssey-auth',
  loginWith: {
    email: true
  },
  userAttributes: {
    email: {
      required: true,
      mutable: false
    },
    name: {
      required: false,
      mutable: true
    }
  },
  multifactor: {
    mode: 'OFF'
  },
  passwordPolicy: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialCharacters: true,
    requireUppercase: true,
    requireLowercase: true,
  },
});
