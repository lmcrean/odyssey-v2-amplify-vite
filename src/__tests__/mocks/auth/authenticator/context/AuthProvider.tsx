import React, { useState, useEffect } from 'react';
import { AuthStatus, AuthRoute } from '../../types/auth.types';
import AuthContext from './AuthContext';
import { mockSignOut } from '../../amplify/authentication/signOut';
import { mockDeleteUser } from '../../amplify/user/deleteUser';
import { toast } from 'react-toastify';

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

  // Effect to sync route with auth status
  useEffect(() => {
    if (authStatus === 'authenticated') {
      setRoute('authenticated');
    } else {
      setRoute('signIn');
    }
  }, [authStatus]);

  const signOut = async () => {
    try {
      toast.info('Signing out...', { autoClose: 2000 });
      await mockSignOut();
      setAuthStatus('unauthenticated');
      toast.success('Successfully signed out!', { autoClose: 2000 });
    } catch (error) {
      toast.error('Failed to sign out. Please try again.', { autoClose: 3000 });
    }
  };

  const deleteAccount = async () => {
    try {
      toast.info('Deleting account...', { autoClose: 2000 });
      await mockDeleteUser();
      setAuthStatus('unauthenticated');
      toast.success('Account successfully deleted!', { autoClose: 2000 });
    } catch (error) {
      toast.error('Failed to delete account. Please try again.', { autoClose: 3000 });
    }
  };

  const toSignIn = () => setRoute('signIn');
  const toSignUp = () => setRoute('signUp');

  return (
    <AuthContext.Provider
      value={{
        route,
        authStatus,
        setAuthStatus,
        signOut,
        deleteAccount,
        toSignIn,
        toSignUp,
        setRoute,
        isAuthenticated: authStatus === 'authenticated',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 