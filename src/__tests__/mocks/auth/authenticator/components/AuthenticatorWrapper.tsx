import React from 'react';
import { useAuthContext } from '../context/AuthContext';
import { AuthenticatorForm } from './AuthenticatorForm';

interface AuthenticatorWrapperProps {
  Component: React.ComponentType<any>;
  [key: string]: any;
}

export const AuthenticatorWrapper: React.FC<AuthenticatorWrapperProps> = ({
  Component,
  ...props
}) => {
  const { isAuthenticated } = useAuthContext();

  return (
    <div data-amplify-authenticator="" data-variation="modal">
      <div data-amplify-container="">
        <div data-amplify-router="">
          {isAuthenticated ? (
            <Component {...props} />
          ) : (
            <AuthenticatorForm />
          )}
        </div>
      </div>
    </div>
  );
}; 