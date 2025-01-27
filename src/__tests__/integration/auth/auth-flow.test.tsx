import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import AuthComponent from '../../../components/AuthComponent';
import { withAuthenticator } from '../../mocks/auth/authenticator/components/withAuthenticator';
import { mockSignOut, mockSignOutError } from '../../mocks/auth/amplify/authentication/signOut';

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

describe('Auth Flow Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(async () => {
      render(<TestComponent _authStatus="authenticated" />);
    });
  });

  it('shows toast notifications during successful sign out', async () => {
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(toast.info).toHaveBeenCalledWith('Signing out...', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Successfully signed out!', expect.any(Object));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('shows error toast when sign out fails', async () => {
    mockSignOutError();
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(toast.info).toHaveBeenCalledWith('Signing out...', expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith('Failed to sign out. Please try again.', expect.any(Object));
    expect(mockSignOut).toHaveBeenCalled();
  });
}); 