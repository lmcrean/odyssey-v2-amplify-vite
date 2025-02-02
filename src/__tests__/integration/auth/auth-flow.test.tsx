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

describe('Auth Flow Integration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await act(async () => {
      render(<AuthComponent authStatus={'authenticated' as AuthStatus} />);
    });
  });

  it('successfully signs out', async () => {
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(mockAmplifySignOut).toHaveBeenCalled();
  });

  it('handles sign out failure', async () => {
    mockAmplifySignOut.mockRejectedValueOnce(new Error('Failed to sign out'));
    
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    expect(signOutButton).toBeInTheDocument();
    
    await act(async () => {
      await fireEvent.click(signOutButton);
    });

    expect(mockAmplifySignOut).toHaveBeenCalled();
  });
}); 