import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthComponent } from '../../../components/AuthComponent';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';

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

describe('Auth Flow Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(async () => {
      render(<AuthComponent />);
    });
  });

  it('shows toast notifications during successful sign out', async () => {
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(mockAmplifySignOut).toHaveBeenCalled();
  });

  it('shows error toast when sign out fails', async () => {
    mockAmplifySignOut.mockRejectedValueOnce(new Error('Failed to sign out'));
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(mockAmplifySignOut).toHaveBeenCalled();
  });
}); 