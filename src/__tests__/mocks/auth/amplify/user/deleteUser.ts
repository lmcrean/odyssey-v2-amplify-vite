import { vi } from 'vitest';
import { toast } from 'react-toastify';

export const mockDeleteUser = vi.fn().mockImplementation(async () => {
  toast.info('Deleting account...', { autoClose: 2000 });
  try {
    await Promise.resolve();
    toast.success('Account successfully deleted!', { autoClose: 2000 });
  } catch (error) {
    toast.error('Failed to delete account. Please try again.', { autoClose: 3000 });
    throw error;
  }
});

export const mockDeleteUserError = () => {
  mockDeleteUser.mockRejectedValueOnce(new Error('Failed to delete user'));
}; 