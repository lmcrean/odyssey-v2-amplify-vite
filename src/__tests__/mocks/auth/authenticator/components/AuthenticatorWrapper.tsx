import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { AuthenticatorForm } from './AuthenticatorForm';

interface AuthenticatorWrapperProps {
  Component: React.ComponentType<any>;
  _authStatus?: string;
  [key: string]: any;
}

export const AuthenticatorWrapper: React.FC<AuthenticatorWrapperProps> = ({
  Component,
  _authStatus = 'authenticated',
  ...props
}) => {
  const { isAuthenticated } = useAuthContext();

  // If _authStatus is provided, use it to determine authentication state
  const shouldRenderComponent = _authStatus === 'authenticated' || isAuthenticated;

  return (
    <div data-amplify-authenticator="" data-variation="modal">
      <div data-amplify-container="">
        <div data-amplify-router="">
          {shouldRenderComponent ? (
            <Component {...props} />
          ) : (
            <AuthenticatorForm />
          )}
        </div>
      </div>
    </div>
  );
}; 