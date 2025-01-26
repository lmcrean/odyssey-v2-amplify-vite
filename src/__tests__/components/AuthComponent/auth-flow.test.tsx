import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import * as auth from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';
import AuthComponent from '../../../components/AuthComponent';
import { mockToSignIn, mockSignOut } from './mocks';
import { setAuthStatus } from './auth-state';

// Mock the auth module
vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(),
  deleteUser: vi.fn(),
}));

// Mock the useAuthenticator hook
vi.mock('@aws-amplify/ui-react', () => ({
  useAuthenticator: vi.fn(() => ({
    signOut: mockSignOut,
    toSignIn: mockToSignIn,
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

describe('AuthComponent Authentication Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthStatus('authenticated');
  });

  it('shows toast notifications during successful sign out', async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    
    render(<AuthComponent />);
    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    
    await act(async () => {
      await fireEvent.click(logoutButton);
    });

    expect(toast.info).toHaveBeenCalledWith('Signing out...', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Successfully signed out!', expect.any(Object));
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockToSignIn).toHaveBeenCalled();
  });

  it('shows error toast when sign out fails', async () => {
    const error = new Error('Sign out failed');
    mockSignOut.mockRejectedValueOnce(error);
    
    render(<AuthComponent />);
    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    
    await act(async () => {
      await fireEvent.click(logoutButton);
    });

    expect(toast.info).toHaveBeenCalledWith('Signing out...', expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith('Failed to sign out. Please try again.', expect.any(Object));
    expect(mockSignOut).toHaveBeenCalled();
  });
}); 