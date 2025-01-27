import '@aws-amplify/ui-react/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { deleteUser } from 'aws-amplify/auth';

export const AuthComponent = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="p-4">
          <ToastContainer position="top-right" />
          <h1 className="text-2xl font-bold mb-4">Hello, {user?.username}!</h1>
          
          <div className="space-y-4">
            <button
              onClick={signOut}
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
                    onClick={async () => {
                      try {
                        await deleteUser();
                        setShowDeleteModal(false);
                        signOut?.();
                      } catch (error) {
                        console.error('Failed to delete account:', error);
                      }
                    }}
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
      )}
    </Authenticator>
  );
};

export default AuthComponent; 