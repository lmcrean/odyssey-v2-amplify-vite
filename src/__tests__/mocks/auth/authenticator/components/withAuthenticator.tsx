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
    const { _authStatus = 'unauthenticated', _route = 'signIn', ...rest } = props;
    
    return (
      <AuthProvider
        initialAuthStatus={_authStatus}
        initialRoute={_route}
      >
        <AuthenticatorWrapper
          Component={Component}
          _authStatus={_authStatus}
          _route={_route}
          {...rest}
        />
      </AuthProvider>
    );
  };
}; 