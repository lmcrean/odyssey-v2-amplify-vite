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
  initialRoute
}) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>(initialAuthStatus);
  const [route, setRoute] = useState<AuthRoute>(
    initialRoute || (initialAuthStatus === 'authenticated' ? 'authenticated' : 'signIn')
  );

  // Ensure route stays in sync with auth status
  useEffect(() => {
    if (authStatus === 'authenticated') {
      setRoute('authenticated');
    } else {
      setRoute('signIn');
    }
  }, [authStatus]);

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
        signOut,
        toSignIn,
        toSignUp,
        setAuthStatus: (status: AuthStatus) => {
          setAuthStatus(status);
        },
        isAuthenticated: authStatus === 'authenticated'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 