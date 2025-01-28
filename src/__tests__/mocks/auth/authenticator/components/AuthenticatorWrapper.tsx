import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { AuthenticatorForm } from './AuthenticatorForm';
import { AuthStatus } from '../../types/auth.types';

interface AuthenticatorWrapperProps {
  Component: React.ComponentType<any>;
  _authStatus?: AuthStatus;
  [key: string]: any;
}

export const AuthenticatorWrapper: React.FC<AuthenticatorWrapperProps> = ({
  Component,
  _authStatus,
  ...rest
}) => {
  const { authStatus: contextAuthStatus, route } = useAuthContext();
  const effectiveAuthStatus = _authStatus || contextAuthStatus;

  // Show form for unauthenticated users
  if (effectiveAuthStatus !== 'authenticated') {
    return <AuthenticatorForm />;
  }

  // Show the wrapped component for authenticated users
  return (
    <>
      <Component {...rest} authStatus={effectiveAuthStatus} route={route} />
    </>
  );
}; 