import React, { useState, useEffect } from 'react';
import { AuthStatus, AuthRoute } from '../../types/auth.types';
import AuthContext from './AuthContext';
import { mockSignOut } from '../../amplify/authentication/signOut';

interface AuthProviderProps {
  children: React.ReactNode;
  initialAuthStatus?: AuthStatus;
  initialRoute?: AuthRoute;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  initialAuthStatus = 'unauthenticated',
  initialRoute = 'signIn'
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(initialAuthStatus);
  const [route, setRoute] = useState<AuthRoute>(initialRoute);

  // Keep state in sync with props
  useEffect(() => {
    setAuthStatus(initialAuthStatus);
  }, [initialAuthStatus]);

  useEffect(() => {
    setRoute(initialRoute);
  }, [initialRoute]);

  const signOut = async () => {
    try {
      await mockSignOut();
      setAuthStatus('unauthenticated');
      setRoute('signIn');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const toSignIn = () => {
    setRoute('signIn');
  };

  const toSignUp = () => {
    setRoute('signUp');
  };

  return (
    <AuthContext.Provider
      value={{
        route,
        authStatus,
        setAuthStatus,
        signOut,
        toSignIn,
        toSignUp,
        setRoute,
        isAuthenticated: authStatus === 'authenticated'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 