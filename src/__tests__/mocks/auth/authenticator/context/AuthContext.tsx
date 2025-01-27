import React, { createContext, useContext } from 'react';
import { AuthStatus, AuthRoute } from '../../types/auth.types';

interface AuthContextType {
  route: AuthRoute;
  authStatus: AuthStatus;
  signOut: () => Promise<void>;
  toSignIn: () => void;
  toSignUp: () => void;
  setAuthStatus: (status: AuthStatus) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  route: 'signIn',
  authStatus: 'unauthenticated',
  signOut: async () => {},
  toSignIn: () => {},
  toSignUp: () => {},
  setAuthStatus: () => {},
  isAuthenticated: false,
});

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 