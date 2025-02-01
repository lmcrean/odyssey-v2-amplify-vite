import { useState } from 'react';
import { toast } from 'react-toastify';
import { updatePassword } from 'aws-amplify/auth';
import { ModalProps } from '../types/auth.types';

interface ChangePasswordModalProps extends ModalProps {}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('New passwords do not match', { autoClose: 3000 });
      return;
    }

    try {
      toast.info('Changing password...', { autoClose: 3000 });
      await updatePassword({ oldPassword, newPassword });
      toast.success('Password changed successfully', { autoClose: 3000 });
      onClose();
      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error('Failed to change password. Please try again.', { autoClose: 3000 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-100">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-200">
              Current Password
            </label>
            <input
              type="password"
              id="oldPassword"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-500 bg-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-200">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-500 bg-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-200">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-500 bg-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => {
              onClose();
              setOldPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
            }}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-100 font-bold py-2 px-4 rounded transition duration-200"
            role="button"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleChangePassword}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-gray-100 font-bold py-2 px-4 rounded transition duration-200"
            role="button"
            aria-label="Change Password"
            data-testid="submit-change-password"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}; 