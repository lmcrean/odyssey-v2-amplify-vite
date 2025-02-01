import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthComponent } from '../../../components/auth';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';
import { AuthStatus } from '../../mocks/auth/types/auth.types';

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: any) => children({
    signOut: mockAmplifySignOut,
    user: { username: 'testuser' }
  })
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

// Import toast for assertions
import { toast } from 'react-toastify';

describe('Auth Flow Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(async () => {
      render(<AuthComponent authStatus={'authenticated' as AuthStatus} />);
    });
  });

  it('shows success toast notification during successful sign in', async () => {
    // Mock the successful sign-in state
    await act(async () => {
      // Simulate successful authentication
      render(
        <AuthComponent authStatus={'authenticated' as AuthStatus} />
      );
    });

    // Verify the success toast was called
    expect(toast.success).toHaveBeenCalledWith('Successfully signed in', { autoClose: 3000 });
  });

  it('shows success toast notification during successful sign out', async () => {
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(mockAmplifySignOut).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Successfully signed out', { autoClose: 3000 });
  });

  it('shows error toast when sign out fails', async () => {
    mockAmplifySignOut.mockRejectedValueOnce(new Error('Failed to sign out'));
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(mockAmplifySignOut).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Failed to sign out. Please try again.', { autoClose: 3000 });
  });
}); 