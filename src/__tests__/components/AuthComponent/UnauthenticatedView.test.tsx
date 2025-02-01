import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthComponent } from '../../../components/auth';
import { withAuthenticator } from '../../mocks/auth/authenticator/components/withAuthenticator';

// Create a wrapped component for testing
const TestComponent = withAuthenticator(AuthComponent);

describe('Unauthenticated View', () => {
  beforeEach(() => {
    render(<TestComponent _authStatus="unauthenticated" _route="signIn" />);
  });

  describe('Authentication Form', () => {
    it('renders sign in tab', () => {
      expect(screen.getByRole('tab', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders create account tab', () => {
      expect(screen.getByRole('tab', { name: /create account/i })).toBeInTheDocument();
    });

    it('renders username input', () => {
      expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument();
    });

    it('renders password input', () => {
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders sign in button', () => {
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });
}); 