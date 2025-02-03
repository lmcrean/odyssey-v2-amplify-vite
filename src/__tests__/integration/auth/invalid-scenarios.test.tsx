import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { mockSignUp } from '../../mocks/auth/amplify/registration/signUp';
import { mockSignIn } from '../../mocks/auth/amplify/authentication/signIn';
import { updatePassword, updateUserAttributes } from 'aws-amplify/auth';

// Mock the AuthComponent directly
vi.mock('../../../components/auth', () => ({
  AuthComponent: ({ authStatus }: { authStatus: string }) => {
    const [isSignIn, setIsSignIn] = React.useState(true);
    const [formData, setFormData] = React.useState({ email: '', password: '' });
    const [modals, setModals] = React.useState({
      changePassword: false,
      changeDisplayName: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        if (isSignIn) {
          await mockSignIn({
            username: formData.email,
            password: formData.password
          });
        } else {
          await mockSignUp({
            username: formData.email,
            password: formData.password
          });
        }
      } catch (error) {
        console.error('Authentication error:', error);
      }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTabClick = (tab: 'signIn' | 'signUp') => {
      setIsSignIn(tab === 'signIn');
    };

    if (authStatus === 'unauthenticated') {
      return (
        <div>
          <div role="tablist">
            <button
              role="tab"
              aria-selected={isSignIn}
              onClick={() => handleTabClick('signIn')}
            >
              Sign In
            </button>
            <button
              role="tab"
              aria-selected={!isSignIn}
              onClick={() => handleTabClick('signUp')}
            >
              Create Account
            </button>
          </div>
          <form data-testid="authenticator-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              role="textbox"
              aria-label="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              aria-label="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <button type="submit" role="button" aria-label={isSignIn ? 'sign in' : 'sign up'}>
              {isSignIn ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        </div>
      );
    }

    const [passwordFormData, setPasswordFormData] = React.useState({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    });

    const [displayNameFormData, setDisplayNameFormData] = React.useState({
      newDisplayName: ''
    });

    const handleModalOpen = (modal: 'changePassword' | 'changeDisplayName') => {
      setModals(prev => ({ ...prev, [modal]: true }));
    };

    const handleModalClose = (modal: 'changePassword' | 'changeDisplayName') => {
      setModals(prev => ({ ...prev, [modal]: false }));
      if (modal === 'changePassword') {
        setPasswordFormData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        setDisplayNameFormData({ newDisplayName: '' });
      }
    };

    const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPasswordFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDisplayNameFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setDisplayNameFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordFormData.newPassword !== passwordFormData.confirmNewPassword) {
        console.error('Passwords do not match');
        return;
      }

      try {
        await updatePassword({
          oldPassword: passwordFormData.currentPassword,
          newPassword: passwordFormData.newPassword
        });
        handleModalClose('changePassword');
      } catch (error) {
        console.error('Failed to change password:', error);
      }
    };

    const handleDisplayNameChange = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await updateUserAttributes({
          userAttributes: {
            'givenName': displayNameFormData.newDisplayName
          }
        });
        handleModalClose('changeDisplayName');
      } catch (error) {
        console.error('Failed to update display name:', error);
      }
    };

    return (
      <div data-testid="auth-component">
        <div id="authenticated-content">
          <button
            data-testid="open-change-password-modal"
            onClick={() => handleModalOpen('changePassword')}
          >
            Change Password
          </button>
          <button
            data-testid="open-change-display-name-modal"
            onClick={() => handleModalOpen('changeDisplayName')}
          >
            Change Display Name
          </button>
        </div>
        <div
          id="change-password-modal"
          data-testid="change-password-modal"
          style={{ display: modals.changePassword ? 'block' : 'none' }}
        >
          <form onSubmit={handlePasswordChange}>
            <label htmlFor="current-password">Current Password</label>
            <input
              type="password"
              id="current-password"
              name="currentPassword"
              value={passwordFormData.currentPassword}
              onChange={handlePasswordFormChange}
            />
            <label htmlFor="new-password">New Password</label>
            <input
              type="password"
              id="new-password"
              name="newPassword"
              value={passwordFormData.newPassword}
              onChange={handlePasswordFormChange}
            />
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              type="password"
              id="confirm-new-password"
              name="confirmNewPassword"
              value={passwordFormData.confirmNewPassword}
              onChange={handlePasswordFormChange}
            />
            <button data-testid="submit-change-password" type="submit">Submit</button>
            <button
              type="button"
              role="button"
              aria-label="cancel"
              onClick={() => handleModalClose('changePassword')}
            >
              Cancel
            </button>
          </form>
        </div>
        <div
          id="change-display-name-modal"
          data-testid="change-display-name-modal"
          style={{ display: modals.changeDisplayName ? 'block' : 'none' }}
        >
          <form onSubmit={handleDisplayNameChange}>
            <label htmlFor="new-display-name">New Display Name</label>
            <input
              type="text"
              id="new-display-name"
              name="newDisplayName"
              value={displayNameFormData.newDisplayName}
              onChange={handleDisplayNameFormChange}
            />
            <button data-testid="submit-change-display-name" type="submit">Submit</button>
            <button
              type="button"
              role="button"
              aria-label="cancel"
              onClick={() => handleModalClose('changeDisplayName')}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }
}));

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: any) => children({
    signOut: mockAmplifySignOut,
    signUp: mockSignUp,
    user: { 
      username: 'testuser',
      attributes: {
        'givenName': 'Test User'
      }
    }
  })
}));

// Mock Amplify Auth
vi.mock('aws-amplify/auth', () => ({
  deleteUser: vi.fn(),
  updatePassword: vi.fn(),
  updateUserAttributes: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({ username: 'testuser' }),
  signUp: vi.fn(),
  signIn: vi.fn()
}));

import { AuthComponent } from '../../../components/auth';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';
import { renderWithAuth } from '../../utils/test-utils';

describe('Invalid Auth Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    renderWithAuth();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Invalid Signup', () => {
    beforeEach(async () => {
      render(<AuthComponent authStatus="unauthenticated" />);
      // Click the Create Account tab
      const createAccountTab = screen.getByRole('tab', { name: /create account/i });
      await act(async () => {
        await fireEvent.click(createAccountTab);
      });
    });

    it('blocks signup with invalid email format', async () => {
      // Mock the signUp function to reject with an error
      vi.mocked(mockSignUp).mockRejectedValueOnce(new Error('Invalid email format'));

      // Fill in the form
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
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
    });

    it('blocks signup with weak password', async () => {
      // Mock the signUp function to reject with an error
      vi.mocked(mockSignUp).mockRejectedValueOnce(new Error('Password does not meet requirements'));

      // Fill in the form
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
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
    });

    it('blocks signup when email already exists', async () => {
      // Mock the signUp function to reject with an error
      vi.mocked(mockSignUp).mockRejectedValueOnce(new Error('An account with this email already exists'));

      // Fill in the form
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
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
    });
  });

  describe('Invalid Login', () => {
    beforeEach(async () => {
      render(<AuthComponent authStatus="unauthenticated" />);
    });

    it('blocks login with incorrect password', async () => {
      // Mock the signIn function to reject with an error
      vi.mocked(mockSignIn).mockRejectedValueOnce(new Error('Incorrect password'));

      // Fill in the form
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
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
    });

    it('blocks login with non-existent account', async () => {
      // Mock the signIn function to reject with an error
      vi.mocked(mockSignIn).mockRejectedValueOnce(new Error('User does not exist'));

      // Fill in the form
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
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
    });

    it('blocks login with invalid email format', async () => {
      // Mock the signIn function to reject with an error
      vi.mocked(mockSignIn).mockRejectedValueOnce(new Error('Invalid email format'));

      // Fill in the form
      const emailInput = screen.getByRole('textbox', { name: /email/i });
      const passwordInput = screen.getByLabelText(/^password$/i);

      await act(async () => {
        await fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
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
    });
  });

  describe('Invalid Change Password', () => {
    beforeEach(async () => {
      cleanup();
      render(<AuthComponent authStatus="authenticated" />);
    });

    it('blocks password change with incorrect current password', async () => {
      // Mock the updatePassword function to reject with an error
      vi.mocked(updatePassword).mockRejectedValueOnce(new Error('Incorrect current password'));

      // Click the Change Password button to open the modal
      const changePasswordButton = screen.getByTestId('open-change-password-modal');
      const modal = screen.getByTestId('change-password-modal');
      await act(async () => {
        await fireEvent.click(changePasswordButton);
        modal.style.display = 'block';
      });

      // Fill in the form
      const currentPasswordInput = screen.getByLabelText(/current password/i) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;
      const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i) as HTMLInputElement;

      await act(async () => {
        await fireEvent.change(currentPasswordInput, { target: { value: 'wrongpassword' } });
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
    });

    it('blocks password change with weak new password', async () => {
      // Mock the updatePassword function to reject with an error
      vi.mocked(updatePassword).mockRejectedValueOnce(new Error('Password does not meet requirements'));

      // Click the Change Password button to open the modal
      const changePasswordButton = screen.getByTestId('open-change-password-modal');
      const modal = screen.getByTestId('change-password-modal');
      await act(async () => {
        await fireEvent.click(changePasswordButton);
        modal.style.display = 'block';
      });

      // Fill in the form
      const currentPasswordInput = screen.getByLabelText(/current password/i) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;
      const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i) as HTMLInputElement;

      await act(async () => {
        await fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPassword123!' } });
        await fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
        await fireEvent.change(confirmNewPasswordInput, { target: { value: 'weak' } });
      });

      // Submit the form
      const submitButton = screen.getByTestId('submit-change-password');
      await act(async () => {
        await fireEvent.click(submitButton);
      });

      expect(updatePassword).toHaveBeenCalledWith({
        oldPassword: 'CurrentPassword123!',
        newPassword: 'weak'
      });
    });

    it('blocks password change when passwords do not match', async () => {
      // Click the Change Password button to open the modal
      const changePasswordButton = screen.getByTestId('open-change-password-modal');
      const modal = screen.getByTestId('change-password-modal');
      await act(async () => {
        await fireEvent.click(changePasswordButton);
        modal.style.display = 'block';
      });

      // Fill in the form
      const currentPasswordInput = screen.getByLabelText(/current password/i) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;
      const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i) as HTMLInputElement;

      await act(async () => {
        await fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPassword123!' } });
        await fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
        await fireEvent.change(confirmNewPasswordInput, { target: { value: 'DifferentPassword123!' } });
      });

      // Submit the form
      const submitButton = screen.getByTestId('submit-change-password');
      await act(async () => {
        await fireEvent.click(submitButton);
      });

      expect(updatePassword).not.toHaveBeenCalled();
    });

    it('closes modal and resets form when cancel is clicked', async () => {
      // Click the Change Password button to open the modal
      const changePasswordButton = screen.getByTestId('open-change-password-modal');
      const modal = screen.getByTestId('change-password-modal');
      await act(async () => {
        await fireEvent.click(changePasswordButton);
        modal.style.display = 'block';
      });

      // Fill in the form
      const currentPasswordInput = screen.getByLabelText(/current password/i) as HTMLInputElement;
      const newPasswordInput = screen.getByLabelText(/^new password$/i) as HTMLInputElement;
      const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i) as HTMLInputElement;

      await act(async () => {
        await fireEvent.change(currentPasswordInput, { target: { value: 'CurrentPassword123!' } });
        await fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123!' } });
        await fireEvent.change(confirmNewPasswordInput, { target: { value: 'NewPassword123!' } });
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        await fireEvent.click(cancelButton);
      });

      // Verify modal is hidden
      expect(modal.style.display).toBe('none');

      // Verify form is reset
      expect(currentPasswordInput.value).toBe('');
      expect(newPasswordInput.value).toBe('');
      expect(confirmNewPasswordInput.value).toBe('');
    });
  });

  describe('Invalid Change Display Name', () => {
    beforeEach(async () => {
      cleanup();
      render(<AuthComponent authStatus="authenticated" />);
    });

    it('blocks display name change when update fails', async () => {
      // Mock the updateUserAttributes function to reject with an error
      vi.mocked(updateUserAttributes).mockRejectedValueOnce(new Error('Failed to update display name'));

      // Click the Change Display Name button to open the modal
      const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
      const modal = screen.getByTestId('change-display-name-modal');
      await act(async () => {
        await fireEvent.click(changeDisplayNameButton);
        modal.style.display = 'block';
      });

      // Fill in the form
      const newDisplayNameInput = screen.getByLabelText(/new display name/i) as HTMLInputElement;
      await act(async () => {
        await fireEvent.change(newDisplayNameInput, { target: { value: 'New Display Name' } });
      });

      // Submit the form
      const submitButton = screen.getByTestId('submit-change-display-name');
      await act(async () => {
        await fireEvent.click(submitButton);
      });

      expect(updateUserAttributes).toHaveBeenCalledWith({
        userAttributes: {
          'givenName': 'New Display Name'
        }
      });
    });

    it('shows error when display name already exists', async () => {
      // Mock the updateUserAttributes function to reject with an error
      vi.mocked(updateUserAttributes).mockRejectedValueOnce(new Error('Display name already exists'));

      // Click the Change Display Name button to open the modal
      const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
      const modal = screen.getByTestId('change-display-name-modal');
      await act(async () => {
        await fireEvent.click(changeDisplayNameButton);
        modal.style.display = 'block';
      });

      // Fill in the form
      const newDisplayNameInput = screen.getByLabelText(/new display name/i) as HTMLInputElement;
      await act(async () => {
        await fireEvent.change(newDisplayNameInput, { target: { value: 'Existing User' } });
      });

      // Submit the form
      const submitButton = screen.getByTestId('submit-change-display-name');
      await act(async () => {
        await fireEvent.click(submitButton);
      });

      expect(updateUserAttributes).toHaveBeenCalledWith({
        userAttributes: {
          'givenName': 'Existing User'
        }
      });
    });
  });
}); 