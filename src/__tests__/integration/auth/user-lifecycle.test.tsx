import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthComponent } from '../../../components/AuthComponent';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';
import { deleteUser, updatePassword, updateUserAttributes } from 'aws-amplify/auth';
import { toast } from 'react-toastify';

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: any) => children({
    signOut: mockAmplifySignOut,
    user: { 
      username: 'testuser',
      attributes: {
        'custom:display_name': 'Test User'
      }
    }
  })
}));

// Mock Amplify Auth
vi.mock('aws-amplify/auth', () => ({
  deleteUser: vi.fn(),
  updatePassword: vi.fn(),
  updateUserAttributes: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({ username: 'testuser' })
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ToastContainer: () => null,
}));

describe('User Lifecycle Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    render(<AuthComponent />);
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
            'custom:display_name': 'New Display Name'
          }
        });
        expect(toast.success).toHaveBeenCalledWith('Display name changed successfully');
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
        expect(toast.error).toHaveBeenCalledWith('Display name cannot be empty');
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
            'custom:display_name': 'New Display Name'
          }
        });
        expect(toast.error).toHaveBeenCalledWith('Failed to change display name. Please try again.');
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

        // Reopen modal and verify form is reset
        await act(async () => {
          await fireEvent.click(changeDisplayNameButton);
        });

        expect(screen.getByLabelText(/new display name/i)).toHaveValue('');
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
        expect(toast.success).toHaveBeenCalledWith('Password changed successfully');
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
        expect(toast.error).toHaveBeenCalledWith('New passwords do not match');
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
        expect(toast.error).toHaveBeenCalledWith('Failed to change password. Please try again.');
      });

      it('closes modal and resets form on cancel', async () => {
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

    it('allows user to delete their account', async () => {
      // Open delete modal
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      await act(async () => {
        await fireEvent.click(deleteButton);
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await act(async () => {
        await fireEvent.click(confirmButton);
      });

      expect(deleteUser).toHaveBeenCalled();
      expect(mockAmplifySignOut).toHaveBeenCalled();
    });

    it('shows error when account deletion fails', async () => {
      vi.mocked(deleteUser).mockRejectedValueOnce(new Error('Failed to delete user'));

      // Open delete modal
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      await act(async () => {
        await fireEvent.click(deleteButton);
      });

      // Confirm deletion
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await act(async () => {
        await fireEvent.click(confirmButton);
      });

      expect(deleteUser).toHaveBeenCalled();
      expect(mockAmplifySignOut).not.toHaveBeenCalled();
    });

    it('cancels account deletion when cancel is clicked', async () => {
      // Open delete modal
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      await act(async () => {
        await fireEvent.click(deleteButton);
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        await fireEvent.click(cancelButton);
      });

      expect(deleteUser).not.toHaveBeenCalled();
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });
}); 