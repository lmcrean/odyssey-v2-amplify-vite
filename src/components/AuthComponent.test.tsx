import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { toast } from 'react-toastify';
import AuthComponent from './AuthComponent';
import { useState } from 'react';
import * as auth from 'aws-amplify/auth';

vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({
    username: 'testuser',
    userId: 'test-user-id',
  }),
  deleteUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
  ToastContainer: () => null,
}));

const mockSignOut = vi.fn();
const mockToSignIn = vi.fn();

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
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

  const handleDeleteAccount = async () => {
    try {
      toast.info('Deleting account...', { autoClose: 2000 });
      await auth.getCurrentUser();
      await auth.deleteUser();
      toast.success('Account successfully deleted!', { autoClose: 2000 });
      toSignIn();
    } catch (error) {
      toast.error('Failed to delete account. Please try again.', { autoClose: 3000 });
      console.error('Delete account error:', error);
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hello, authenticated user!</h1>
      <div className="space-y-4">
        <button onClick={handleSignOut}>Sign Out</button>
        <button onClick={() => setShowDeleteModal(true)}>Delete Account</button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Delete Account</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button onClick={handleDeleteAccount}>Confirm</button>
            </div>
          </div>
        </div>
      )}
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
    expect(mockToSignIn).not.toHaveBeenCalled();
  });

  describe('Delete Account', () => {
    it('renders delete account button', () => {
      render(<AuthComponent />);
      expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });

    it('shows confirmation modal when delete button is clicked', async () => {
      render(<AuthComponent />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      await act(async () => {
        await fireEvent.click(deleteButton);
      });
      
      expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('cancels deletion when cancel is clicked', async () => {
      render(<AuthComponent />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      await act(async () => {
        await fireEvent.click(deleteButton);
      });
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        await fireEvent.click(cancelButton);
      });
      
      expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
      expect(vi.mocked(auth.deleteUser)).not.toHaveBeenCalled();
    });

    it('shows toast notifications during successful account deletion', async () => {
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce({
        username: 'testuser',
        userId: 'test-user-id',
      });
      vi.mocked(auth.deleteUser).mockResolvedValueOnce(undefined);
      
      render(<AuthComponent />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      await act(async () => {
        await fireEvent.click(deleteButton);
      });
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await act(async () => {
        await fireEvent.click(confirmButton);
      });
      
      expect(toast.info).toHaveBeenCalledWith('Deleting account...', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Account successfully deleted!', expect.any(Object));
      expect(vi.mocked(auth.deleteUser)).toHaveBeenCalled();
      expect(mockToSignIn).toHaveBeenCalled();
    });

    it('shows error toast when account deletion fails', async () => {
      const error = new Error('Delete account failed');
      vi.mocked(auth.getCurrentUser).mockResolvedValueOnce({
        username: 'testuser',
        userId: 'test-user-id',
      });
      vi.mocked(auth.deleteUser).mockRejectedValueOnce(error);
      
      render(<AuthComponent />);
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      
      await act(async () => {
        await fireEvent.click(deleteButton);
      });
      
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await act(async () => {
        await fireEvent.click(confirmButton);
      });
      
      expect(toast.info).toHaveBeenCalledWith('Deleting account...', expect.any(Object));
      expect(toast.error).toHaveBeenCalledWith('Failed to delete account. Please try again.', expect.any(Object));
      expect(vi.mocked(auth.deleteUser)).toHaveBeenCalled();
      expect(mockToSignIn).not.toHaveBeenCalled();
    });
  });
});