import { useState } from 'react';
import { toast } from 'react-toastify';
import { AuthenticatedContentProps } from '../types/auth.types';
import { ChangeDisplayNameModal } from '../modals/ChangeDisplayNameModal';
import { ChangePasswordModal } from '../modals/ChangePasswordModal';
import { DeleteAccountModal } from '../modals/DeleteAccountModal';

export const AuthenticatedContent: React.FC<AuthenticatedContentProps> = ({ signOut, user }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeDisplayNameModal, setShowChangeDisplayNameModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out', { autoClose: 3000 });
    } catch (error) {
      console.error('Failed to sign out:', error);
      toast.error('Failed to sign out. Please try again.', { autoClose: 3000 });
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-100" data-testid="authenticated-view">
      <h1 className="text-2xl font-bold mb-4 text-gray-100">
        Hello, {user?.signInDetails?.loginId || 'User'}!
      </h1>
      
      <div className="space-y-4">
        <button
          onClick={() => setShowChangeDisplayNameModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-gray-100 font-bold py-2 px-4 rounded w-full transition duration-200"
          role="button"
          aria-label="Change Display Name"
          data-testid="open-change-display-name-modal"
        >
          Change Display Name
        </button>

        <button
          onClick={() => setShowChangePasswordModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-gray-100 font-bold py-2 px-4 rounded w-full transition duration-200"
          role="button"
          aria-label="Change Password"
          data-testid="open-change-password-modal"
        >
          Change Password
        </button>

        <button
          onClick={handleSignOut}
          className="bg-red-600 hover:bg-red-700 text-gray-100 font-bold py-2 px-4 rounded w-full transition duration-200"
          role="button"
          aria-label="Sign Out"
        >
          Sign Out
        </button>
        
        <button
          onClick={() => setShowDeleteModal(true)}
          className="bg-red-800 hover:bg-red-900 text-gray-100 font-bold py-2 px-4 rounded w-full transition duration-200"
          role="button"
          aria-label="Delete Account"
          data-testid="open-delete-account-modal"
        >
          Delete Account
        </button>
      </div>

      <ChangeDisplayNameModal
        isOpen={showChangeDisplayNameModal}
        onClose={() => setShowChangeDisplayNameModal(false)}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSignOut={handleSignOut}
      />
    </div>
  );
}; 