import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import * as auth from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';
import AuthComponent from '../../../components/AuthComponent';
import { mockToSignIn } from './mocks';
import { setAuthStatus } from './auth-state';

// Mock the auth module
vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock the useAuthenticator hook
vi.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: vi.fn(() => ({
    signOut: vi.fn(),
    toSignIn: mockToSignIn,
    user: {
      username: 'testuser',
      userId: 'test-user-id',
    },
  })),
  withAuthenticator: (component: any) => component,
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

describe('AuthComponent Account Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthStatus('authenticated');
  });

  describe('Delete Account', () => {
    it('renders delete account button', () => {
      render(<AuthComponent />);
      expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });

    it('shows confirmation modal when delete button is clicked', async () => {
      render(<AuthComponent />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      await act(async () => {
        await fireEvent.click(deleteButton);
      });
      
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('cancels deletion when cancel is clicked', async () => {
      render(<AuthComponent />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      await act(async () => {
        await fireEvent.click(deleteButton);
      });
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        await fireEvent.click(cancelButton);
      });
      
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
      expect(vi.mocked(auth.deleteUser)).not.toHaveBeenCalled();
    });

    it('shows toast notifications during successful account deletion', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce({
        username: 'testuser',
        userId: 'test-user-id',
      });
      vi.mocked(auth.deleteUser).mockResolvedValueOnce(undefined);
      
      render(<AuthComponent />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      await act(async () => {
        await fireEvent.click(deleteButton);
      });
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await act(async () => {
        await fireEvent.click(confirmButton);
      });
      
      expect(toast.info).toHaveBeenCalledWith('Deleting account...', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Account successfully deleted!', expect.any(Object));
      expect(vi.mocked(auth.deleteUser)).toHaveBeenCalled();
      expect(mockToSignIn).toHaveBeenCalled();
    });

    it('shows error toast when account deletion fails', async () => {
      const error = new Error('Delete account failed');
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce({
        username: 'testuser',
        userId: 'test-user-id',
      });
      vi.mocked(auth.deleteUser).mockRejectedValueOnce(error);
      
      render(<AuthComponent />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      await act(async () => {
        await fireEvent.click(deleteButton);
      });
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await act(async () => {
        await fireEvent.click(confirmButton);
      });
      
      expect(toast.info).toHaveBeenCalledWith('Deleting account...', expect.any(Object));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete account. Please try again.', expect.any(Object));
      expect(vi.mocked(auth.deleteUser)).toHaveBeenCalled();
    });
  });
}); 