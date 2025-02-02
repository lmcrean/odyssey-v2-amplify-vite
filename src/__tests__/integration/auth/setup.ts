import { vi } from 'vitest';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';
import { mockToast, ToastContainer } from '../../mocks/toast';

// Mock CSS modules
vi.mock('@aws-amplify/ui-react/styles.css', () => ({}));
vi.mock('react-toastify/dist/ReactToastify.css', () => ({}));

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
  getCurrentUser: vi.fn().mockResolvedValue({ username: 'testuser' })
}));

// Mock toast
vi.mock('react-toastify', () => ({
  toast: mockToast,
  ToastContainer,
})); 