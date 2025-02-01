import { toast } from 'react-toastify';
import { deleteUser } from 'aws-amplify/auth';
import { ModalProps } from '../types/auth.types';

interface DeleteAccountModalProps extends ModalProps {
  onSignOut: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose, onSignOut }) => {
  const handleDeleteAccount = async () => {
    try {
      await deleteUser();
      toast.success('Account deleted successfully', { autoClose: 3000 });
      onClose();
      onSignOut();
    } catch (error) {
      console.error('Failed to delete account:', error);
      toast.error('Failed to delete account. Please try again.', { autoClose: 3000 });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4 text-gray-100">Delete Account</h2>
        <p className="mb-6 text-gray-200">
          Are you sure you want to delete your account? This action cannot be undone.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-100 font-bold py-2 px-4 rounded transition duration-200"
            role="button"
            aria-label="Cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            className="flex-1 bg-red-600 hover:bg-red-700 text-gray-100 font-bold py-2 px-4 rounded transition duration-200"
            role="button"
            aria-label="Delete Account"
            data-testid="confirm-delete-account"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}; 