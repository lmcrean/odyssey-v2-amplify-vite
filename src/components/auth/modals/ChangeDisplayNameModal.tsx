import { useState } from 'react';
import { toast } from 'react-toastify';
import { updateUserAttributes } from 'aws-amplify/auth';
import { ModalProps } from '../types/auth.types';

interface ChangeDisplayNameModalProps extends ModalProps {}

export const ChangeDisplayNameModal: React.FC<ChangeDisplayNameModalProps> = ({ isOpen, onClose }) => {
  const [newDisplayName, setNewDisplayName] = useState('');

  const handleChangeDisplayName = async () => {
    if (!newDisplayName.trim()) {
      toast.error('Display name cannot be empty', { autoClose: 3000 });
      return;
    }

    try {
      toast.info('Changing display name...', { autoClose: 3000 });
      await updateUserAttributes({
        userAttributes: {
          'custom:display_name': newDisplayName.trim()
        }
      });
      toast.success('Display name changed successfully', { autoClose: 3000 });
      onClose();
      setNewDisplayName('');
    } catch (error) {
      console.error('Failed to change display name:', error);
      const errorMessage = error instanceof Error && error.message === 'Display name already taken'
        ? 'This display name is already taken. Please choose another.'
        : 'Failed to change display name. Please try again.';
      toast.error(errorMessage, { autoClose: 3000 });
    }
  };

  if (!isOpen) return null;

  return (
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
              onClose();
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
  );
}; 