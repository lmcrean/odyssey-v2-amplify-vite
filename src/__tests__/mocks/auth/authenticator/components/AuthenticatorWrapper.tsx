import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { AuthenticatorForm } from './AuthenticatorForm';

interface AuthenticatorWrapperProps {
  Component: React.ComponentType<any>;
  [key: string]: any;
}

export const AuthenticatorWrapper: React.FC<AuthenticatorWrapperProps> = ({
  Component,
  ...rest
}) => {
  const { authStatus, route } = useAuthContext();

  // Show form for unauthenticated users
  if (authStatus !== 'authenticated') {
    return <AuthenticatorForm />;
  }

  // Show the wrapped component for authenticated users
  return (
    <>
      <Component {...rest} authStatus={authStatus} route={route} />
    </>
  );
}; 