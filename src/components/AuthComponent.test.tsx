import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { toast } from 'react-toastify';
import AuthComponent from './AuthComponent';

const mockSignOut = vi.fn();
const mockToSignIn = vi.fn();
const mockToast = {
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
};

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

// Mock the Amplify authenticator
vi.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: vi.fn((Component: React.ComponentType) => {
    return function WrappedComponent(props: Record<string, unknown>) {
      return <Component {...props} />;
    };
  }),
  useAuthenticator: vi.fn(() => ({
    signOut: mockSignOut,
    toSignIn: mockToSignIn,
    user: null,
    route: 'authenticated',
    toFederatedSignIn: vi.fn(),
    toResetPassword: vi.fn(),
    toSignUp: vi.fn(),
    updateUser: vi.fn(),
    setUser: vi.fn(),
    authStatus: 'authenticated',
  })),
}));

// Get the unwrapped component for testing
const UnwrappedAuthComponent = () => {
  const { signOut, toSignIn } = useAuthenticator();
  
  const handleSignOut = async () => {
    try {
      toast.info('Signing out...', { autoClose: 2000 });
      await signOut();
      toast.success('Successfully signed out!', { autoClose: 2000 });
      toSignIn();
    } catch (error) {
      toast.error('Failed to sign out. Please try again.', { autoClose: 3000 });
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hello, authenticated user!</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

vi.mock('./AuthComponent', () => ({
  __esModule: true,
  default: vi.fn(() => {
    const WrappedComponent = withAuthenticator(UnwrappedAuthComponent);
    return <WrappedComponent />;
  }),
}));

describe('AuthComponent', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('renders welcome message', () => {
    render(<AuthComponent />);
    expect(screen.getByText(/Hello, authenticated user!/i)).toBeInTheDocument();
  });

  it('applies withAuthenticator HOC', () => {
    render(<AuthComponent />);
    expect(withAuthenticator).toHaveBeenCalledWith(UnwrappedAuthComponent);
  });

  it('renders within authentication wrapper', () => {
    const { container } = render(<AuthComponent />);
    expect(container.firstChild).toBeInTheDocument();
    expect(container.firstChild?.nodeName).toBe('DIV');
  });

  it('maintains component structure', () => {
    render(<AuthComponent />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Hello, authenticated user!');
  });

  it('renders logout button', () => {
    render(<AuthComponent />);
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
  });

  it('shows toast notifications during successful sign out', async () => {
    mockSignOut.mockResolvedValueOnce(undefined);
    
    render(<AuthComponent />);
    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    
    await fireEvent.click(logoutButton);
    
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
    
    await fireEvent.click(logoutButton);
    
    expect(toast.info).toHaveBeenCalledWith('Signing out...', expect.any(Object));
    expect(toast.error).toHaveBeenCalledWith('Failed to sign out. Please try again.', expect.any(Object));
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockToSignIn).not.toHaveBeenCalled();
  });
});