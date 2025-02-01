// import { test, expect } from '@playwright/test';
// import { fillSignInForm, clickSignIn, clickDeleteAccount } from '../../../../utils/auth/form';
// import { expectSuccessToast } from '../../../../utils/toast';
// import validUser from '../../../../fixtures/user/valid.json';

// test.describe('Valid Account Deletion Flow', () => {
//   test.beforeEach(async ({ page }) => {
//     // Sign in first
//     await page.goto('/');
//     await fillSignInForm(page, validUser.email, validUser.password);
//     await clickSignIn(page);
//     await expect(page.getByRole('button', { name: /delete account/i })).toBeVisible();
//   });

//   test('completes account deletion process', async ({ page }) => {
//     // Open delete modal
//     await clickDeleteAccount(page);
//     await expect(page.getByRole('dialog')).toBeVisible();

//     // Confirm deletion
//     await page.getByRole('button', { name: /confirm/i }).click();

//     // Verify successful deletion
//     await expectSuccessToast(page, 'Account deleted successfully');
    
//     // Verify return to sign in view
//     await expect(page.getByRole('tab', { name: /sign in/i })).toBeVisible();
//   });
// }); 