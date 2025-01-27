import { vi } from 'vitest';
import { toast } from 'react-toastify';

export const mockConfirmSignUp = vi.fn().mockImplementation(async () => {
  toast.info('Confirming sign up...', { autoClose: 2000 });
  try {
    await Promise.resolve();
    toast.success('Sign up confirmed successfully!', { autoClose: 2000 });
  } catch (error) {
    toast.error('Failed to confirm sign up. Please try again.', { autoClose: 3000 });
    throw error;
  }
});

export const mockConfirmSignUpError = () => {
  mockConfirmSignUp.mockRejectedValueOnce(new Error('Failed to confirm sign up'));
}; 