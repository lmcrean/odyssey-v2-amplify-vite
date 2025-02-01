// import { test, expect } from '@playwright/test';
// import { fillSignInForm, clickSignIn } from '../../../utils/auth/form';
// import { expectErrorToast } from '../../../utils/toast';
// import malformedUser from '../../../fixtures/user/invalid/malformed.json' assert { type: 'json' };
// import deletedUser from '../../../fixtures/user/invalid/deleted.json' assert { type: 'json' };

// test.describe('Invalid Sign In Flow', () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto('/');
//   });

//   test('shows error for non-existent user', async ({ page }) => {
//     await fillSignInForm(page, malformedUser.email, malformedUser.password);
//     await clickSignIn(page);

//     await expectErrorToast(page, 'User does not exist');
//   });

//   test('shows error for incorrect password', async ({ page }) => {
//     await fillSignInForm(page, deletedUser.email, 'WrongPassword123!');
//     await clickSignIn(page);

//     await expectErrorToast(page, 'Incorrect username or password');
//   });

//   test('shows error for deleted account', async ({ page }) => {
//     await fillSignInForm(page, deletedUser.email, deletedUser.password);
//     await clickSignIn(page);

//     await expectErrorToast(page, 'Account has been deleted');
//   });
// }); 