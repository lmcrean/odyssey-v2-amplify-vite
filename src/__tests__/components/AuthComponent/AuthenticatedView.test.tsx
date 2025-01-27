import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';


// Mock AWS Amplify auth functions
vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ username: 'testuser' }),
  deleteUser: vi.fn().mockResolvedValue(undefined),
}));

// Create mock functions
const mockSignOut = vi.fn().mockResolvedValue(undefined);

// Mock AWS Amplify UI React components
vi.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: (Component: any) => Component,
  useAuthenticator: () => ({
    route: 'authenticated',
    signOut: mockSignOut,
  }),
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

import AuthComponent from '../../../components/AuthComponent';

describe('Authenticated View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      render(<AuthComponent />);
    });
  });

  describe('Welcome Message', () => {
    it('renders greeting', () => {
      expect(screen.getByText(/hello, authenticated user!/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders and handles sign out button', async () => {
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(signOutButton);
      });
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it('renders and handles delete account button with modal flow', async () => {
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      expect(deleteButton).toBeInTheDocument();
      
      // Click delete account button to show modal
      await act(async () => {
        fireEvent.click(deleteButton);
      });
      
      // Verify modal appears
      expect(screen.getByText(/are you sure you want to delete your account\?/i)).toBeInTheDocument();
      
      // Test cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        fireEvent.click(cancelButton);
      });
      expect(screen.queryByText(/are you sure you want to delete your account\?/i)).not.toBeInTheDocument();
      
      // Show modal again and test confirm deletion
      await act(async () => {
        fireEvent.click(deleteButton);
      });
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await act(async () => {
        fireEvent.click(confirmButton);
      });
      
      const { getCurrentUser, deleteUser } = await import('aws-amplify/auth');
      expect(getCurrentUser).toHaveBeenCalledTimes(1);
      expect(deleteUser).toHaveBeenCalledTimes(1);
    });
  });
}); 