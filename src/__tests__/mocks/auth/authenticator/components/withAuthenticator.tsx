import React from 'react';
import { AuthProvider } from '../context/AuthProvider';
import { AuthenticatorWrapper } from './AuthenticatorWrapper';
import { AuthStatus, AuthRoute } from '../../types/auth.types';

interface WithAuthenticatorProps {
  _authStatus?: AuthStatus;
  _route?: AuthRoute;
  setAuthStatus?: (status: AuthStatus) => void;
  [key: string]: any;
}

export const withAuthenticator = (Component: React.ComponentType<any>) => {
  return function WrappedWithAuthenticator(props: WithAuthenticatorProps) {
    return (
      <AuthProvider
        initialAuthStatus={props._authStatus}
        initialRoute={props._route}
      >
        <AuthenticatorWrapper
          Component={Component}
          {...props}
        />
      </AuthProvider>
    );
  };
}; 