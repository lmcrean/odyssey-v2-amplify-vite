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
    nickname: {
      required: false,
      mutable: true
    }
  },
  multifactor: {
    mode: 'OFF'
  }
});
