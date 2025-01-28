import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthComponent } from '../../../components/AuthComponent';
import { withAuthenticator } from '../../mocks/auth/authenticator/components/withAuthenticator';
import { mockSignUp } from '../../mocks/auth/amplify/registration/signUp';
import { mockSignIn } from '../../mocks/auth/amplify/authentication/signIn';
import { toast } from 'react-toastify';

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
}); 