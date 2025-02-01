import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthComponent } from '../../../components/auth';

// Mock toast notifications
vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock Amplify UI Authenticator
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: { children: Function }) => children({
    signOut: vi.fn(),
    user: { 
      signInDetails: { 
        loginId: 'authenticated user' 
      }
    }
  }),
}));

// Mock Amplify Auth
vi.mock('aws-amplify/auth', () => ({
  deleteUser: vi.fn(),
  getCurrentUser: vi.fn(),
}));

describe('Authenticated View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(<AuthComponent authStatus="authenticated" />);
  });

  describe('Welcome Message', () => {
    it('renders greeting', () => {
      expect(screen.getByText(/Hello, authenticated user!/i)).toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('renders and handles sign out button', async () => {
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(signOutButton);
      });
    });

    it('renders and handles delete account button with modal flow', async () => {
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      expect(deleteButton).toBeInTheDocument();
      
      // Click delete account button to show modal
      await act(async () => {
        fireEvent.click(deleteButton);
      });
      
      // Verify modal appears
      expect(screen.getByText(/Are you sure you want to delete your account\?/i)).toBeInTheDocument();
      
      // Test cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        fireEvent.click(cancelButton);
      });
      expect(screen.queryByText(/Are you sure you want to delete your account\?/i)).not.toBeInTheDocument();
      
      // Show modal again and test confirm deletion
      await act(async () => {
        fireEvent.click(deleteButton);
      });
      const confirmButton = screen.getByTestId('confirm-delete-account');
      await act(async () => {
        fireEvent.click(confirmButton);
      });
    });
  });
}); 