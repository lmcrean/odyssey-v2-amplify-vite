import { test as base, expect } from '@playwright/test';

// Mock Amplify Auth
const mockAuth = {
  currentAuthenticatedUser: async () => ({
    username: 'test-user',
    attributes: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      sub: '123',
    },
  }),
  signOut: async () => {},
  deleteUser: async () => {},
};

// Mock window.Auth
const mockWindow = async (page) => {
  await page.addInitScript(`
    window.Auth = {
      currentAuthenticatedUser: async () => ({
        username: 'test-user',
        attributes: {
          email: '${process.env.TEST_USER_EMAIL || 'test@example.com'}',
          sub: '123',
        },
      }),
      signOut: async () => {},
      deleteUser: async () => {},
    };
  `);
};

// Create a test fixture that includes Auth mock setup
export const test = base.extend({
  page: async ({ page }, use) => {
    await mockWindow(page);
    await use(page);
  },
});

export { expect }; 
