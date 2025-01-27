import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthComponent } from '../../../components/AuthComponent';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';
import { deleteUser } from 'aws-amplify/auth';

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: any) => children({
    signOut: mockAmplifySignOut,
    user: { username: 'testuser' }
  })
}));

// Mock Amplify Auth
vi.mock('aws-amplify/auth', () => ({
  deleteUser: vi.fn(),
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