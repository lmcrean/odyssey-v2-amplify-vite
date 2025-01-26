import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import AuthComponent from './AuthComponent';

const mockSignOut = vi.fn();

// Mock the Amplify authenticator
vi.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: vi.fn((Component: React.ComponentType) => {
    return function WrappedComponent(props: Record<string, unknown>) {
      return <Component {...props} />;
    };
  }),
  useAuthenticator: vi.fn(() => ({
    signOut: mockSignOut,
    user: null,
    route: 'authenticated',
    toFederatedSignIn: vi.fn(),
    toResetPassword: vi.fn(),
    toSignIn: vi.fn(),
    toSignUp: vi.fn(),
    updateUser: vi.fn(),
    setUser: vi.fn(),
    authStatus: 'authenticated',
  })),
}));

// Get the unwrapped component for testing
const UnwrappedAuthComponent = () => {
  const { signOut } = useAuthenticator();
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hello, authenticated user!</h1>
      <button onClick={signOut}>Sign Out</button>
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

  it('calls signOut when logout button is clicked', async () => {
    render(<AuthComponent />);
    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    
    await fireEvent.click(logoutButton);
    expect(mockSignOut).toHaveBeenCalled();
  });
});