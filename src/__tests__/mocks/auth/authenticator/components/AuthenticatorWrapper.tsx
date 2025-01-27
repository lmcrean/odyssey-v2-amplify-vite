import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { AuthenticatorForm } from './AuthenticatorForm';
import { toast } from 'react-toastify';
import { mockDeleteUser } from '../../amplify/user/deleteUser';

interface AuthenticatorWrapperProps {
  Component: React.ComponentType<any>;
  _authStatus?: string;
  _route?: string;
  [key: string]: any;
}

export const AuthenticatorWrapper: React.FC<AuthenticatorWrapperProps> = ({
  Component,
  _authStatus,
  _route,
  ...rest
}) => {
  const { authStatus, setAuthStatus } = useAuthContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      await mockDeleteUser();
      toast.success('Account successfully deleted!', { autoClose: 2000 });
      setAuthStatus('unauthenticated');
    } catch (error) {
      toast.error('Failed to delete account. Please try again.', { autoClose: 3000 });
    } finally {
      setShowDeleteModal(false);
    }
  };

  const currentAuthStatus = _authStatus || authStatus;
  const currentRoute = _route || (currentAuthStatus === 'authenticated' ? 'authenticated' : 'signIn');

  if (currentAuthStatus !== 'authenticated') {
    return <AuthenticatorForm />;
  }

  return (
    <div>
      <Component 
        {...rest} 
        authStatus={currentAuthStatus}
        route={currentRoute}
      />
      <div className="p-4">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="amplify-button"
          aria-label="Delete Account"
        >
          Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Delete Account</h2>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                role="button"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                role="button"
                aria-label="Confirm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 