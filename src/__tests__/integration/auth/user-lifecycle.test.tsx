import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'react-toastify';
import { AuthComponent } from '../../../components/AuthComponent';
import { withAuthenticator } from '../../mocks/auth/authenticator/components/withAuthenticator';
import { mockSignUp, mockSignUpError } from '../../mocks/auth/amplify/registration/signUp';
import { mockDeleteUser, mockDeleteUserError } from '../../mocks/auth/amplify/user/deleteUser';

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Create a wrapped component for testing
const TestComponent = withAuthenticator(AuthComponent);

describe('User Lifecycle Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  it('handles signup, login, and account deletion flow', async () => {
    // Start with signup
    const { unmount } = render(<TestComponent _authStatus="unauthenticated" />);
    
    // Click "Create Account" tab
    const createAccountTab = screen.getByRole('tab', { name: /create account/i });
    await act(async () => {
      await fireEvent.click(createAccountTab);
    });

    // Fill in signup form
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    await act(async () => {
      await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      await fireEvent.change(passwordInput, { target: { value: 'TestPassword123!' } });
    });

    // Submit signup form
    const signUpButton = screen.getByRole('button', { name: /sign up/i });
    await act(async () => {
      await fireEvent.click(signUpButton);
    });

    // Verify signup was called with correct credentials
    expect(mockSignUp).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'TestPassword123!',
    });

    // Clean up previous render
    unmount();

    // Re-render to reflect authenticated state
    render(<TestComponent _authStatus="authenticated" _route="authenticated" />);

    // Verify we see the authenticated view
    expect(screen.getByText(/hello, authenticated user/i)).toBeInTheDocument();
    
    // Find and click delete account button
    const deleteButton = screen.getByRole('button', { name: /delete account/i });
    await act(async () => {
      await fireEvent.click(deleteButton);
    });

    // Verify confirmation modal appears
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Click confirm button
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await act(async () => {
      await fireEvent.click(confirmButton);
    });

    // Verify account deletion was called
    expect(mockDeleteUser).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Account successfully deleted!', expect.any(Object));
  });

  describe('Account Creation', () => {
    beforeEach(() => {
      render(<TestComponent _authStatus="unauthenticated" />);
    });

    afterEach(() => {
      cleanup();
    });

    it('allows user to navigate to sign up form', async () => {
      const createAccountTab = screen.getByRole('tab', { name: /create account/i });
      await act(async () => {
        await fireEvent.click(createAccountTab);
      });
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('handles sign up process', async () => {
      // Navigate to sign up form
      const createAccountTab = screen.getByRole('tab', { name: /create account/i });
      await act(async () => {
        await fireEvent.click(createAccountTab);
      });

      // Fill in the form
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      await act(async () => {
        await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        await fireEvent.change(passwordInput, { target: { value: 'TestPassword123!' } });
      });

      // Submit the form
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      await act(async () => {
        await fireEvent.click(signUpButton);
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'TestPassword123!',
      });
    });

    it('handles sign up errors', async () => {
      mockSignUpError();

      // Navigate to sign up form
      const createAccountTab = screen.getByRole('tab', { name: /create account/i });
      await act(async () => {
        await fireEvent.click(createAccountTab);
      });

      // Fill in the form
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      await act(async () => {
        await fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        await fireEvent.change(passwordInput, { target: { value: 'TestPassword123!' } });
      });

      // Submit the form
      const signUpButton = screen.getByRole('button', { name: /sign up/i });
      await act(async () => {
        await fireEvent.click(signUpButton);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to create account. Please try again.', expect.any(Object));
    });
  });

  describe('Account Management', () => {
    beforeEach(() => {
      render(<TestComponent _authStatus="authenticated" />);
    });

    afterEach(() => {
      cleanup();
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

      expect(mockDeleteUser).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Account successfully deleted!', expect.any(Object));
    });

    it('shows error when account deletion fails', async () => {
      mockDeleteUserError();

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

      expect(mockDeleteUser).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to delete account. Please try again.', expect.any(Object));
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

      expect(mockDeleteUser).not.toHaveBeenCalled();
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
    });
  });
}); 