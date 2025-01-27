import { vi } from 'vitest';
import { toast } from 'react-toastify';

export const mockSignOut = vi.fn().mockImplementation(async () => {
  toast.info('Signing out...', { autoClose: 2000 });
  try {
    await Promise.resolve();
    toast.success('Successfully signed out!', { autoClose: 2000 });
  } catch (error) {
    toast.error('Failed to sign out. Please try again.', { autoClose: 3000 });
    throw error;
  }
});

export const mockSignOutError = () => {
  mockSignOut.mockRejectedValueOnce(new Error('Failed to sign out'));
}; 