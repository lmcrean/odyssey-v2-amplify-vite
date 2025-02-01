// import { test, expect } from '@playwright/test';
// import { fillSignUpForm, clickCreateAccount } from '../../../utils/auth/form';
// import { expectErrorToast } from '../../../utils/toast';
// import malformedUser from '../../../fixtures/user/invalid/malformed.json' assert { type: 'json' };
// import invalidPasswordUser from '../../../fixtures/user/invalid/invalid-password.json' assert { type: 'json' };

// test.describe('Invalid Sign Up Flow', () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto('/');
//     await page.getByRole('tab', { name: /create account/i }).click();
//   });

//   test('shows error for malformed email', async ({ page }) => {
//     await fillSignUpForm(page, malformedUser.email, malformedUser.password, malformedUser.confirmPassword);
//     await clickCreateAccount(page);

//     await expectErrorToast(page, 'Invalid email format');
//   });

//   test('shows error for invalid password format', async ({ page }) => {
//     await fillSignUpForm(
//       page, 
//       invalidPasswordUser.email, 
//       invalidPasswordUser.password, 
//       invalidPasswordUser.confirmPassword
//     );
//     await clickCreateAccount(page);

//     await expectErrorToast(page, 'Password must contain at least 8 characters');
//   });

//   test('shows error for mismatched passwords', async ({ page }) => {
//     await fillSignUpForm(page, malformedUser.email, 'Password123!', 'DifferentPassword123!');
//     await clickCreateAccount(page);

//     await expectErrorToast(page, 'Passwords do not match');
//   });
// }); 