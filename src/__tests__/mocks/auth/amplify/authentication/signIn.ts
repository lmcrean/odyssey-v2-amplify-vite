import { vi } from 'vitest';
import { SignInInput, SignInOutput } from '../../types/auth.types';

export const mockSignIn = vi.fn((input: SignInInput): Promise<SignInOutput> => {
  console.log('Mock SignIn called with:', input);
  return Promise.resolve().then(() => {
    return {
      isSignedIn: true,
      nextStep: { signInStep: 'DONE' }
    };
  });
});

export const mockSignInError = () => {
  mockSignIn.mockRejectedValueOnce(new Error('Failed to sign in'));
}; 