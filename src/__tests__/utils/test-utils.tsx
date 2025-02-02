import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthComponent } from '../../components/auth';
import { mockSignOut as mockAmplifySignOut } from '../mocks/auth/amplify/ui-react/Authenticator';
import { mockToast, ToastContainer } from '../mocks/toast';

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: any) => children({
    signOut: mockAmplifySignOut,
    user: { 
      username: 'testuser',
      attributes: {
        'givenName': 'Test User'
      }
    }
  })
}));

// Mock Amplify Auth
vi.mock('aws-amplify/auth', () => ({
  deleteUser: vi.fn(),
  updatePassword: vi.fn(),
  updateUserAttributes: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({ username: 'testuser' }),
  signUp: vi.fn(),
  signIn: vi.fn()
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: mockToast,
  ToastContainer,
}));

type AuthStatus = 'authenticated' | 'unauthenticated';

export const renderWithAuth = (authStatus: AuthStatus = 'authenticated') => {
  return render(<AuthComponent authStatus={authStatus} />);
};

export const mockSignUp = vi.fn();
export const mockSignIn = vi.fn(); 