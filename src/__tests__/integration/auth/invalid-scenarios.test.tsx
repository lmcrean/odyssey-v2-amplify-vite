import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthComponent } from '../../../components/AuthComponent';
import { withAuthenticator } from '../../mocks/auth/authenticator/components/withAuthenticator';
import { mockSignUp } from '../../mocks/auth/amplify/registration/signUp';
import { mockSignIn } from '../../mocks/auth/amplify/authentication/signIn';
import { updatePassword, updateUserAttributes } from 'aws-amplify/auth';
import { toast } from 'react-toastify';

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: any) => children({
    signOut: vi.fn(),
    user: { 
      username: 'testuser',
      attributes: {
        'custom:display_name': 'Test User'
      }
    }
  }),
  ToastContainer: () => null
}));

// Mock toast notifications
vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock Amplify Auth
vi.mock('aws-amplify/auth', () => ({
  signUp: vi.fn(),
  signIn: vi.fn(),
  updatePassword: vi.fn(),
  updateUserAttributes: vi.fn(),
  deleteUser: vi.fn(),
  getCurrentUser: vi.fn(),
}));

// Mock mockSignUp function
vi.mock('../../mocks/auth/amplify/registration/signUp', () => ({
  mockSignUp: vi.fn(),
}));

// Mock mockSignIn function
vi.mock('../../mocks/auth/amplify/authentication/signIn', () => ({
  mockSignIn: vi.fn(),
}));

// Create a wrapped component for testing
const TestComponent = withAuthenticator(AuthComponent);

describe('Invalid Auth Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Invalid Signup', () => {
    beforeEach(async () => {
      render(<TestComponent _authStatus="unauthenticated" _route="signIn" />);
      
      // Click the Create Account tab
      const createAccountTab = screen.getByRole('tab', { name: /create account/i });
      await act(async () => {
        await fireEvent.click(createAccountTab);
      });
    });

    it('blocks signup and shows toast error for invalid email format', async () => {
      // Mock the signUp function to reject with an error
      vi.mocked(mockSignUp).mockRejectedValueOnce(new Error('Invalid email format'));

      // Fill in the form with invalid email
      const usernameInput = screen.getByRole('textbox', { name: /username/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(usernameInput, { target: { value: 'invalid-email' } });
        await fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      });

      // Submit the form
      const form = screen.getByTestId('authenticator-form');
      await act(async () => {
        await fireEvent.submit(form);
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        username: 'invalid-email',
        password: 'Password123!'
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to create account. Please try again.', { autoClose: 3000 });
    });

    it('blocks signup and shows toast error for weak password', async () => {
      // Mock the signUp function to reject with an error
      vi.mocked(mockSignUp).mockRejectedValueOnce(new Error('Password does not meet requirements'));

      // Fill in the form with weak password
      const usernameInput = screen.getByRole('textbox', { name: /username/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
        await fireEvent.change(passwordInput, { target: { value: 'weak' } });
      });

      // Submit the form
      const form = screen.getByTestId('authenticator-form');
      await act(async () => {
        await fireEvent.submit(form);
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'weak'
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to create account. Please try again.', { autoClose: 3000 });
    });

    it('blocks signup and shows toast error for existing email', async () => {
      // Mock the signUp function to reject with an error
      vi.mocked(mockSignUp).mockRejectedValueOnce(new Error('An account with this email already exists'));

      // Fill in the form with existing email
      const usernameInput = screen.getByRole('textbox', { name: /username/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(usernameInput, { target: { value: 'existing@example.com' } });
        await fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      });

      // Submit the form
      const form = screen.getByTestId('authenticator-form');
      await act(async () => {
        await fireEvent.submit(form);
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        username: 'existing@example.com',
        password: 'Password123!'
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to create account. Please try again.', { autoClose: 3000 });
    });
  });

  describe('Invalid Login', () => {
    beforeEach(async () => {
      render(<TestComponent _authStatus="unauthenticated" _route="signIn" />);
    });

    it('blocks login and shows toast error for incorrect password', async () => {
      // Mock the signIn function to reject with an error
      vi.mocked(mockSignIn).mockRejectedValueOnce(new Error('Incorrect username or password'));

      // Fill in the form with valid email but incorrect password
      const usernameInput = screen.getByRole('textbox', { name: /username/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(usernameInput, { target: { value: 'test@example.com' } });
        await fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      });

      // Submit the form
      const form = screen.getByTestId('authenticator-form');
      await act(async () => {
        await fireEvent.submit(form);
      });

      expect(mockSignIn).toHaveBeenCalledWith({
        username: 'test@example.com',
        password: 'wrongpassword'
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to sign in. Please try again.', { autoClose: 3000 });
    });

    it('blocks login and shows toast error for non-existent account', async () => {
      // Mock the signIn function to reject with an error
      vi.mocked(mockSignIn).mockRejectedValueOnce(new Error('User does not exist'));

      // Fill in the form with non-existent account
      const usernameInput = screen.getByRole('textbox', { name: /username/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(usernameInput, { target: { value: 'nonexistent@example.com' } });
        await fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      });

      // Submit the form
      const form = screen.getByTestId('authenticator-form');
      await act(async () => {
        await fireEvent.submit(form);
      });

      expect(mockSignIn).toHaveBeenCalledWith({
        username: 'nonexistent@example.com',
        password: 'Password123!'
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to sign in. Please try again.', { autoClose: 3000 });
    });

    it('blocks login and shows toast error for invalid email format', async () => {
      // Mock the signIn function to reject with an error
      vi.mocked(mockSignIn).mockRejectedValueOnce(new Error('Invalid email format'));

      // Fill in the form with invalid email
      const usernameInput = screen.getByRole('textbox', { name: /username/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(usernameInput, { target: { value: 'invalid-email' } });
        await fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      });

      // Submit the form
      const form = screen.getByTestId('authenticator-form');
      await act(async () => {
        await fireEvent.submit(form);
      });

      expect(mockSignIn).toHaveBeenCalledWith({
        username: 'invalid-email',
        password: 'Password123!'
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to sign in. Please try again.', { autoClose: 3000 });
    });
  });

  describe('Invalid Change Password', () => {
    beforeEach(async () => {
      render(
        <TestComponent 
          _authStatus="authenticated"
          _route="authenticated"
        />
      );

      // Click the Change Password button to open the modal
      const changePasswordButton = screen.getByTestId('open-change-password-modal');
      await act(async () => {
        await fireEvent.click(changePasswordButton);
      });
    });

    it('blocks password change and shows error for incorrect current password', async () => {
      // Mock updatePassword to reject with an error
      vi.mocked(updatePassword).mockRejectedValueOnce(new Error('Incorrect password'));

      // Fill in the form with incorrect current password
      const oldPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

      await act(async () => {
        await fireEvent.change(oldPasswordInput, { target: { value: 'wrongpassword' } });
        await fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
        await fireEvent.change(confirmNewPasswordInput, { target: { value: 'NewPassword123!' } });
      });

      // Submit the form
      const submitButton = screen.getByTestId('submit-change-password');
      await act(async () => {
        await fireEvent.click(submitButton);
      });

      expect(updatePassword).toHaveBeenCalledWith({
        oldPassword: 'wrongpassword',
        newPassword: 'NewPassword123!'
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to change password. Please try again.', { autoClose: 3000 });
    });

    it('blocks password change and shows error when passwords do not match', async () => {
      // Fill in the form with mismatched passwords
      const oldPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

      await act(async () => {
        await fireEvent.change(oldPasswordInput, { target: { value: 'currentpassword' } });
        await fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
        await fireEvent.change(confirmNewPasswordInput, { target: { value: 'DifferentPassword123!' } });
      });

      // Submit the form
      const submitButton = screen.getByTestId('submit-change-password');
      await act(async () => {
        await fireEvent.click(submitButton);
      });

      expect(updatePassword).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('New passwords do not match', { autoClose: 3000 });
    });

    it('blocks password change and shows error for weak new password', async () => {
      // Mock updatePassword to reject with an error
      vi.mocked(updatePassword).mockRejectedValueOnce(new Error('Password does not meet requirements'));

      // Fill in the form with weak new password
      const oldPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

      await act(async () => {
        await fireEvent.change(oldPasswordInput, { target: { value: 'currentpassword' } });
        await fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
        await fireEvent.change(confirmNewPasswordInput, { target: { value: 'weak' } });
      });

      // Submit the form
      const submitButton = screen.getByTestId('submit-change-password');
      await act(async () => {
        await fireEvent.click(submitButton);
      });

      expect(updatePassword).toHaveBeenCalledWith({
        oldPassword: 'currentpassword',
        newPassword: 'weak'
      });
      expect(toast.error).toHaveBeenCalledWith('Failed to change password. Please try again.', { autoClose: 3000 });
    });

    it('closes modal and resets form when cancel is clicked', async () => {
      // Fill in the form
      const oldPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

      await act(async () => {
        await fireEvent.change(oldPasswordInput, { target: { value: 'currentpassword' } });
        await fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
        await fireEvent.change(confirmNewPasswordInput, { target: { value: 'NewPassword123!' } });
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        await fireEvent.click(cancelButton);
      });

      // Verify modal is closed and form is reset
      expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/^new password$/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/confirm new password/i)).not.toBeInTheDocument();
    });
  });

  describe('Invalid Change Display Name', () => {
    beforeEach(async () => {
      render(
        <TestComponent 
          _authStatus="authenticated"
          _route="authenticated"
        />
      );

      // Click the Change Display Name button to open the modal
      const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
      await act(async () => {
        await fireEvent.click(changeDisplayNameButton);
      });
    });

    it('blocks display name change and shows error for empty display name', async () => {
      // Fill in the form with empty display name
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
      expect(toast.error).toHaveBeenCalledWith('Display name cannot be empty', { autoClose: 3000 });
    });

    it('blocks display name change and shows error when update fails', async () => {
      // Mock updateUserAttributes to reject with an error
      vi.mocked(updateUserAttributes).mockRejectedValueOnce(new Error('Failed to update display name'));

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
      expect(toast.error).toHaveBeenCalledWith('Failed to change display name. Please try again.', { autoClose: 3000 });
    });

    it('closes modal and resets form when cancel is clicked', async () => {
      // Fill in the form
      const displayNameInput = screen.getByLabelText(/new display name/i);
      await act(async () => {
        await fireEvent.change(displayNameInput, { target: { value: 'New Display Name' } });
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        await fireEvent.click(cancelButton);
      });

      // Verify modal is closed and form is reset
      expect(screen.queryByLabelText(/new display name/i)).not.toBeInTheDocument();

      // Reopen modal and verify form is reset
      const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
      await act(async () => {
        await fireEvent.click(changeDisplayNameButton);
      });

      expect(screen.getByLabelText(/new display name/i)).toHaveValue('');
    });
  });
}); 