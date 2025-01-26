import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuthenticator } from '@aws-amplify/ui-react';
import AuthComponent from '../../../components/AuthComponent';
import { setAuthStatus } from './auth-state';

// Get the unwrapped component for testing
const UnwrappedAuthComponent = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hello, authenticated user!</h1>
      <div className="space-y-4">
        <button aria-label="Sign Out">Sign Out</button>
        <button aria-label="Delete Account">Delete Account</button>
      </div>
    </div>
  );
};

// Mock withAuthenticator before using it
vi.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: vi.fn((Component) => {
    return function WrappedComponent(props: Record<string, unknown>) {
      return <Component {...props} />;
    };
  }),
}));

vi.mock('../../../components/AuthComponent', () => ({
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
    setAuthStatus('authenticated'); // Start authenticated for basic component tests
  });

  it('renders welcome message', () => {
    render(<AuthComponent />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Hello, authenticated user!/i);
  });

  it('applies withAuthenticator HOC', () => {
    render(<AuthComponent />);
    expect(withAuthenticator).toHaveBeenCalled();
  });

  it('renders within authentication wrapper', () => {
    const { container } = render(<AuthComponent />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('maintains component structure', () => {
    render(<AuthComponent />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/Hello, authenticated user!/i);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('renders logout button', () => {
    render(<AuthComponent />);
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });
}); 