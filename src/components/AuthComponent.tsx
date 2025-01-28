import '@aws-amplify/ui-react/styles.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { deleteUser, updatePassword, updateUserAttributes } from 'aws-amplify/auth';

export const AuthComponent = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showChangeDisplayNameModal, setShowChangeDisplayNameModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');

  const handleChangeDisplayName = async () => {
    if (!newDisplayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    try {
      toast.info('Changing display name...');
      await updateUserAttributes({
        userAttributes: {
          'custom:display_name': newDisplayName.trim()
        }
      });
      toast.success('Display name changed successfully');
      setShowChangeDisplayNameModal(false);
      setNewDisplayName('');
    } catch (error) {
      console.error('Failed to change display name:', error);
      toast.error('Failed to change display name. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      toast.info('Changing password...');
      await updatePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully');
      setShowChangePasswordModal(false);
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password. Please try again.');
    }
  };

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="p-4">
          <ToastContainer position="top-right" />
          <h1 className="text-2xl font-bold mb-4">
            Hello, {user?.attributes?.['custom:display_name'] || user?.username}!
          </h1>
          
          <div className="space-y-4">
            <button
              onClick={() => setShowChangeDisplayNameModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
              role="button"
              aria-label="Change Display Name"
              data-testid="open-change-display-name-modal"
            >
              Change Display Name
            </button>

            <button
              onClick={() => setShowChangePasswordModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded w-full"
              role="button"
              aria-label="Change Password"
              data-testid="open-change-password-modal"
            >
              Change Password
            </button>

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

          {/* Change Display Name Modal */}
          {showChangeDisplayNameModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Change Display Name</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newDisplayName" className="block text-sm font-medium text-gray-700">
                      New Display Name
                    </label>
                    <input
                      type="text"
                      id="newDisplayName"
                      value={newDisplayName}
                      onChange={(e) => setNewDisplayName(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => {
                      setShowChangeDisplayNameModal(false);
                      setNewDisplayName('');
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    role="button"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangeDisplayName}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    role="button"
                    aria-label="Change Display Name"
                    data-testid="submit-change-display-name"
                  >
                    Change Display Name
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Change Password Modal */}
          {showChangePasswordModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="oldPassword"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={() => {
                      setShowChangePasswordModal(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                    role="button"
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    role="button"
                    aria-label="Change Password"
                    data-testid="submit-change-password"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          )}

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
                        toast.error('Failed to delete account. Please try again.');
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