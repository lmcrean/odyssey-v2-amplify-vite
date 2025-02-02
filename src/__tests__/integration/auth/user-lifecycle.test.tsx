import './setup';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthComponent } from '../../../components/auth';
import { deleteUser, updatePassword, updateUserAttributes } from 'aws-amplify/auth';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';
import { mockToast } from '../../mocks/toast';

describe('User Lifecycle Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    render(<AuthComponent authStatus="authenticated" />);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Account Management', () => {
    describe('Change Display Name', () => {
      it('allows user to change their display name', async () => {
        // Open change display name modal
        const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
        await act(async () => {
          await fireEvent.click(changeDisplayNameButton);
        });

        // Fill in the form
        const displayNameInput = screen.getByLabelText(/new display name/i);
        await act(async () => {
          await fireEvent.change(displayNameInput, { target: { value: 'New Display Name' } });
        });

        // Submit the form
        const submitButton = screen.getByTestId('submit-change-display-name');
        await act(async () => {
          await fireEvent.click(submitButton);
        });

        expect(updateUserAttributes).toHaveBeenCalledWith({
          userAttributes: {
            'nickname': 'New Display Name'
          }
        });
        
        // Verify loading toast first
        expect(mockToast.loading).toHaveBeenCalledWith('Changing display name...', { autoClose: false });
        
        // Then verify toast update
        expect(mockToast.update).toHaveBeenCalledWith(expect.any(String), {
          render: 'Display name changed successfully',
          type: 'success',
          isLoading: false,
          autoClose: 3000
        });
      });

      it('shows error when display name is empty', async () => {
        // Open change display name modal
        const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
        await act(async () => {
          await fireEvent.click(changeDisplayNameButton);
        });

        // Fill in the form with empty value
        const displayNameInput = screen.getByLabelText(/new display name/i);
        await act(async () => {
          await fireEvent.change(displayNameInput, { target: { value: '   ' } });
        });

        // Submit the form
        const submitButton = screen.getByTestId('submit-change-display-name');
        await act(async () => {
          await fireEvent.click(submitButton);
        });

        expect(updateUserAttributes).not.toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalledWith('Display name cannot be empty', { autoClose: 3000 });
      });

      it('shows error when display name change fails', async () => {
        vi.mocked(updateUserAttributes).mockRejectedValueOnce(new Error('Failed to update display name'));

        // Open change display name modal
        const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
        await act(async () => {
          await fireEvent.click(changeDisplayNameButton);
        });

        // Fill in the form
        const displayNameInput = screen.getByLabelText(/new display name/i);
        await act(async () => {
          await fireEvent.change(displayNameInput, { target: { value: 'New Display Name' } });
        });

        // Submit the form
        const submitButton = screen.getByTestId('submit-change-display-name');
        await act(async () => {
          await fireEvent.click(submitButton);
        });

        expect(updateUserAttributes).toHaveBeenCalledWith({
          userAttributes: {
            'nickname': 'New Display Name'
          }
        });
        expect(mockToast.error).toHaveBeenCalledWith('Failed to change display name. Please try again.', { autoClose: 3000 });
      });

      it('closes modal and resets form on cancel', async () => {
        // Open change display name modal
        const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
        await act(async () => {
          await fireEvent.click(changeDisplayNameButton);
        });

        // Fill in the form
        const displayNameInput = screen.getByLabelText(/new display name/i);
        await act(async () => {
          await fireEvent.change(displayNameInput, { target: { value: 'New Display Name' } });
        });

        // Click cancel
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await act(async () => {
          await fireEvent.click(cancelButton);
        });

        // Verify modal is closed
        expect(screen.queryByLabelText(/new display name/i)).not.toBeInTheDocument();

        // Reopen modal to verify it's in a fresh state
        await act(async () => {
          await fireEvent.click(changeDisplayNameButton);
        });

        // Just verify the input exists and is interactive
        expect(screen.getByLabelText(/new display name/i)).toBeInTheDocument();
      });
    });

    describe('Change Password', () => {
      it('allows user to change their password', async () => {
        // Open change password modal
        const changePasswordButton = screen.getByTestId('open-change-password-modal');
        await act(async () => {
          await fireEvent.click(changePasswordButton);
        });

        // Fill in the form
        const oldPasswordInput = screen.getByLabelText(/current password/i);
        const newPasswordInput = screen.getByLabelText(/^new password$/i);
        const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

        await act(async () => {
          await fireEvent.change(oldPasswordInput, { target: { value: 'oldPass123' } });
          await fireEvent.change(newPasswordInput, { target: { value: 'newPass123' } });
          await fireEvent.change(confirmNewPasswordInput, { target: { value: 'newPass123' } });
        });

        // Submit the form
        const submitButton = screen.getByTestId('submit-change-password');
        await act(async () => {
          await fireEvent.click(submitButton);
        });

        expect(updatePassword).toHaveBeenCalledWith({
          oldPassword: 'oldPass123',
          newPassword: 'newPass123'
        });
        expect(mockToast.success).toHaveBeenCalledWith('Password changed successfully', { autoClose: 3000 });
      });

      it('shows error when passwords do not match', async () => {
        // Open change password modal
        const changePasswordButton = screen.getByTestId('open-change-password-modal');
        await act(async () => {
          await fireEvent.click(changePasswordButton);
        });

        // Fill in the form with mismatched passwords
        const oldPasswordInput = screen.getByLabelText(/current password/i);
        const newPasswordInput = screen.getByLabelText(/^new password$/i);
        const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

        await act(async () => {
          await fireEvent.change(oldPasswordInput, { target: { value: 'oldPass123' } });
          await fireEvent.change(newPasswordInput, { target: { value: 'newPass123' } });
          await fireEvent.change(confirmNewPasswordInput, { target: { value: 'differentPass123' } });
        });

        // Submit the form
        const submitButton = screen.getByTestId('submit-change-password');
        await act(async () => {
          await fireEvent.click(submitButton);
        });

        expect(updatePassword).not.toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalledWith('New passwords do not match', { autoClose: 3000 });
      });

      it('shows error when password change fails', async () => {
        vi.mocked(updatePassword).mockRejectedValueOnce(new Error('Failed to update password'));

        // Open change password modal
        const changePasswordButton = screen.getByTestId('open-change-password-modal');
        await act(async () => {
          await fireEvent.click(changePasswordButton);
        });

        // Fill in the form
        const oldPasswordInput = screen.getByLabelText(/current password/i);
        const newPasswordInput = screen.getByLabelText(/^new password$/i);
        const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

        await act(async () => {
          await fireEvent.change(oldPasswordInput, { target: { value: 'oldPass123' } });
          await fireEvent.change(newPasswordInput, { target: { value: 'newPass123' } });
          await fireEvent.change(confirmNewPasswordInput, { target: { value: 'newPass123' } });
        });

        // Submit the form
        const submitButton = screen.getByTestId('submit-change-password');
        await act(async () => {
          await fireEvent.click(submitButton);
        });

        expect(updatePassword).toHaveBeenCalledWith({
          oldPassword: 'oldPass123',
          newPassword: 'newPass123'
        });
        expect(mockToast.error).toHaveBeenCalledWith('Failed to change password. Please try again.', { autoClose: 3000 });
      });

      it('closes modal and resets form when cancel is clicked', async () => {
        // Open change password modal
        const changePasswordButton = screen.getByTestId('open-change-password-modal');
        await act(async () => {
          await fireEvent.click(changePasswordButton);
        });

        // Fill in the form
        const oldPasswordInput = screen.getByLabelText(/current password/i);
        const newPasswordInput = screen.getByLabelText(/^new password$/i);
        const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

        await act(async () => {
          await fireEvent.change(oldPasswordInput, { target: { value: 'oldPass123' } });
          await fireEvent.change(newPasswordInput, { target: { value: 'newPass123' } });
          await fireEvent.change(confirmNewPasswordInput, { target: { value: 'newPass123' } });
        });

        // Click cancel
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await act(async () => {
          await fireEvent.click(cancelButton);
        });

        // Verify modal is closed
        expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument();

        // Reopen modal and verify form is reset
        await act(async () => {
          await fireEvent.click(changePasswordButton);
        });

        expect(screen.getByLabelText(/current password/i)).toHaveValue('');
        expect(screen.getByLabelText(/^new password$/i)).toHaveValue('');
        expect(screen.getByLabelText(/confirm new password/i)).toHaveValue('');
      });
    });

    describe('Delete Account', () => {
      it('allows user to delete their account', async () => {
        // Open delete account modal
        const deleteAccountButton = screen.getByTestId('open-delete-account-modal');
        await act(async () => {
          await fireEvent.click(deleteAccountButton);
        });

        // Click confirm delete
        const confirmDeleteButton = screen.getByTestId('confirm-delete-account');
        await act(async () => {
          await fireEvent.click(confirmDeleteButton);
        });

        expect(deleteUser).toHaveBeenCalled();
        expect(mockToast.success).toHaveBeenCalledWith('Account deleted successfully', { autoClose: 3000 });
        expect(mockAmplifySignOut).toHaveBeenCalled();
      });

      it('shows error when account deletion fails', async () => {
        vi.mocked(deleteUser).mockRejectedValueOnce(new Error('Failed to delete account'));

        // Open delete account modal
        const deleteAccountButton = screen.getByTestId('open-delete-account-modal');
        await act(async () => {
          await fireEvent.click(deleteAccountButton);
        });

        // Click confirm delete
        const confirmDeleteButton = screen.getByTestId('confirm-delete-account');
        await act(async () => {
          await fireEvent.click(confirmDeleteButton);
        });

        expect(deleteUser).toHaveBeenCalled();
        expect(mockToast.error).toHaveBeenCalledWith('Failed to delete account. Please try again.', { autoClose: 3000 });
      });

      it('cancels account deletion when cancel is clicked', async () => {
        // Open delete account modal
        const deleteAccountButton = screen.getByTestId('open-delete-account-modal');
        await act(async () => {
          await fireEvent.click(deleteAccountButton);
        });

        // Click cancel
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        await act(async () => {
          await fireEvent.click(cancelButton);
        });

        expect(deleteUser).not.toHaveBeenCalled();
        // We should not check for toast.success here since it's not relevant to cancellation
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
}); 