import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import AuthComponent from '../../../components/AuthComponent';
import { withAuthenticator } from '../../mocks/auth/authenticator/components/withAuthenticator';

// Create a wrapped component for testing
const TestComponent = withAuthenticator(AuthComponent);

describe('Authenticated View', () => {
  beforeEach(() => {
    render(<TestComponent _authStatus="authenticated" _route="authenticated" />);
  });

  describe('Welcome Message', () => {
    it('renders greeting', () => {
      expect(screen.getByText(/hello, authenticated user/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders sign out button', () => {
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });

    it('renders delete account button', () => {
      expect(screen.getByRole('button', { name: /delete account/i })).toBeInTheDocument();
    });
  });
}); 