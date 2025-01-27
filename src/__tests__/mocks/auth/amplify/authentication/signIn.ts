import { vi } from 'vitest';
import { SignInInput, SignInOutput } from '../../types/auth.types';
import { toast } from 'react-toastify';

export const mockSignIn = vi.fn<[SignInInput], Promise<SignInOutput>>().mockImplementation(async () => {
  toast.info('Signing in...', { autoClose: 2000 });
  try {
    await Promise.resolve();
    const result = {
      isSignedIn: true,
      nextStep: { signInStep: 'DONE' }
    };
    toast.success('Successfully signed in!', { autoClose: 2000 });
    return result;
  } catch (error) {
    toast.error('Failed to sign in. Please try again.', { autoClose: 3000 });
    throw error;
  }
});

export const mockSignInError = () => {
  mockSignIn.mockRejectedValueOnce(new Error('Failed to sign in'));
}; 