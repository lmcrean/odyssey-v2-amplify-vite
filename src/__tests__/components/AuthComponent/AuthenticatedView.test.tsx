import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toast } from 'react-toastify';
import { AuthComponent } from '../../../components/AuthComponent';
import { AuthProvider } from '../../mocks/auth/authenticator/context/AuthProvider';

// Mock toast notifications
vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

describe('Authenticated View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    act(() => {
      render(
        <AuthProvider initialAuthStatus="authenticated" initialRoute="authenticated">
          <AuthComponent />
        </AuthProvider>
      );
    });
  });

  describe('Welcome Message', () => {
    it('renders greeting', () => {
      expect(screen.getByText(/hello, authenticated user!/i)).toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('renders and handles sign out button', async () => {
      const signOutButton = screen.getByRole('button', { name: /sign out/i });
      expect(signOutButton).toBeInTheDocument();
      
      await act(async () => {
        fireEvent.click(signOutButton);
      });
      
      expect(toast.info).toHaveBeenCalledWith('Signing out...', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Successfully signed out!', expect.any(Object));
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
      
      expect(toast.info).toHaveBeenCalledWith('Deleting account...', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Account successfully deleted!', { autoClose: 2000 });
    });
  });
}); 