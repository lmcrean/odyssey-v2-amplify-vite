import React from 'react';
import { vi } from 'vitest';

export const mockSignOut = vi.fn();
export const mockSignUp = vi.fn();
export const mockUser = {
  username: 'authenticated user',
  signInDetails: {
    loginId: 'authenticated user'
  }
  // Add other user properties as needed
};

interface AuthenticatorProps {
  children: (props: {
    signOut: typeof mockSignOut;
    signUp: typeof mockSignUp;
    user: typeof mockUser;
  }) => React.ReactNode;
}

export const Authenticator: React.FC<AuthenticatorProps> = ({ children }) => {
  return <>{children({ signOut: mockSignOut, signUp: mockSignUp, user: mockUser })}</>;
}; 