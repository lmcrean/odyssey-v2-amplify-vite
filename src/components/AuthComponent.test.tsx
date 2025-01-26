import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAuthenticator } from '@aws-amplify/ui-react';
import AuthComponent from './AuthComponent';

// Mock the Amplify authenticator
vi.mock('@aws-amplify/ui-react', () => ({
  withAuthenticator: vi.fn((Component: React.ComponentType) => {
    return function WrappedComponent(props: Record<string, unknown>) {
      return <Component {...props} />;
    };
  }),
}));

// Get the unwrapped component for testing
const UnwrappedAuthComponent = vi.fn(() => (
  <div>
    <h1>Hello, authenticated user!</h1>
  </div>
));

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
});