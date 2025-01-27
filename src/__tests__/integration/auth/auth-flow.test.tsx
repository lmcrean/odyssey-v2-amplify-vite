import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'react-toastify';
import { AuthComponent } from '../../../components/AuthComponent';
import { mockSignOutError } from '../../mocks/auth/amplify/authentication/signOut';
import { AuthProvider } from '../../mocks/auth/authenticator/context/AuthProvider';

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ToastContainer: () => null,
}));

describe('Auth Flow Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(async () => {
      render(
        <AuthProvider initialAuthStatus="authenticated" initialRoute="authenticated">
          <AuthComponent />
        </AuthProvider>
      );
    });
  });

  it('shows toast notifications during successful sign out', async () => {
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(toast.info).toHaveBeenCalledWith('Signing out...', expect.any(Object));
    expect(toast.success).toHaveBeenCalledWith('Successfully signed out!', expect.any(Object));
  });

  it('shows error toast when sign out fails', async () => {
    mockSignOutError();
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(toast.info).toHaveBeenCalledWith('Signing out...', expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith('Failed to sign out. Please try again.', expect.any(Object));
  });
}); 