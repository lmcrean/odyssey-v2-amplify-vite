import { useState } from 'react';
import { toast } from 'react-toastify';
import { updateUserAttributes } from 'aws-amplify/auth';
import { ModalProps } from '../types/auth.types';

interface ChangeDisplayNameModalProps extends ModalProps {}

export const ChangeDisplayNameModal: React.FC<ChangeDisplayNameModalProps> = ({ isOpen, onClose }) => {
  const [newDisplayName, setNewDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeDisplayName = async () => {
    if (!newDisplayName.trim()) {
      toast.error('Display name cannot be empty', { autoClose: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      // Clear any existing toasts
      toast.dismiss();
      
      // Show loading toast
      const loadingToast = toast.loading('Changing display name...', { autoClose: false });
      
      await updateUserAttributes({
        userAttributes: {
          nickname: newDisplayName.trim()
        }
      });

      // Update the loading toast to success
      toast.update(loadingToast, {
        render: 'Display name changed successfully',
        type: 'success',
        isLoading: false,
        autoClose: 3000
      });

      setNewDisplayName('');
      onClose();
    } catch (error) {
      console.error('Failed to change display name:', error);
      toast.error('Failed to change display name. Please try again.', { autoClose: 3000 });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-100">Change Display Name</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="newDisplayName" className="block text-sm font-medium text-gray-200">
              New Display Name
            </label>
            <input
              type="text"
              id="newDisplayName"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-500 bg-gray-600 text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              data-testid="new-display-name-input"
            />
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-100 font-bold py-2 px-4 rounded transition duration-200"
            role="button"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleChangeDisplayName}
            className={`flex-1 ${isLoading ? 'bg-indigo-400' : 'bg-indigo-500 hover:bg-indigo-600'} text-white font-bold py-2 px-4 rounded transition duration-200`}
            disabled={isLoading}
            data-testid="submit-change-display-name"
          >
            {isLoading ? 'Changing...' : 'Change Display Name'}
          </button>
        </div>
      </div>
    </div>
  );
}; 