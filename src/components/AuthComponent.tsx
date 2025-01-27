import { useAuthenticator } from '../__tests__/mocks/auth/authenticator/hooks/useAuthenticator';
import '@aws-amplify/ui-react/styles.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { getCurrentUser, deleteUser } from 'aws-amplify/auth';
import { withAuthenticator } from '../__tests__/mocks/auth/authenticator/components/withAuthenticator';

interface AuthComponentProps {
  authStatus?: string;
  route?: string;
}

export const AuthComponent = ({ authStatus: authStatusProp }: AuthComponentProps) => {
  const { authStatus: authStatusContext, signOut } = useAuthenticator((context) => [context.authStatus]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSignOut = async () => {
    try {
      toast.info('Signing out...', { autoClose: 2000 });
      await signOut();
      toast.success('Successfully signed out!', { autoClose: 2000 });
    } catch (error) {
      toast.error('Failed to sign out. Please try again.', { autoClose: 3000 });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      toast.info('Deleting account...', { autoClose: 2000 });
      await getCurrentUser(); // Verify user is authenticated
      await deleteUser();
      toast.success('Account successfully deleted!', { autoClose: 2000 });
    } catch (error) {
      toast.error('Failed to delete account. Please try again.', { autoClose: 3000 });
    } finally {
      setShowDeleteModal(false);
    }
  };

  // Only show authenticated view when authStatus is authenticated
  const currentAuthStatus = authStatusProp || authStatusContext;
  if (currentAuthStatus === 'authenticated') {
    return (
      <div className="p-4">
        <ToastContainer position="top-right" />
        <h1 className="text-2xl font-bold mb-4">Hello, authenticated user!</h1>
        
        <div className="space-y-4">
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full"
            role="button"
            aria-label="Sign Out"
          >
            Sign Out
          </button>
          
          <button
            onClick={() => setShowDeleteModal(true)}
            className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-4 rounded w-full"
            role="button"
            aria-label="Delete Account"
          >
            Delete Account
          </button>
        </div>

        {/* Delete Account Confirmation Modal */}
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
  }

  return null;
};

export default withAuthenticator(AuthComponent); 