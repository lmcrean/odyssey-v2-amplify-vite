import { vi } from 'vitest';
import { SignUpInput, SignUpOutput } from '../../types/auth.types';
import { toast } from 'react-toastify';

export const mockSignUp = vi.fn<[SignUpInput], Promise<SignUpOutput>>().mockImplementation(async () => {
  toast.info('Creating account...', { autoClose: 2000 });
  try {
    await Promise.resolve();
    const result = {
      userId: 'test-user-id',
      isSignUpComplete: true,
      nextStep: { signUpStep: 'DONE' }
    };
    toast.success('Account created successfully!', { autoClose: 2000 });
    return result;
  } catch (error) {
    toast.error('Failed to create account. Please try again.', { autoClose: 3000 });
    throw error;
  }
});

export const mockSignUpError = () => {
  mockSignUp.mockRejectedValueOnce(new Error('Failed to sign up'));
}; 