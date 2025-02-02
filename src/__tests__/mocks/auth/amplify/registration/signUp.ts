import { vi } from 'vitest';
import { SignUpInput, SignUpOutput } from '../../../../../types/auth.types';

export const mockSignUp = vi.fn((input: SignUpInput): Promise<SignUpOutput> => {
  console.log('Mock SignUp called with:', input);
  return Promise.resolve().then(() => {
    return {
      userId: 'test-user-id',
      isSignUpComplete: true,
      nextStep: { signUpStep: 'DONE' }
    };
  });
});

export const mockSignUpError = () => {
  mockSignUp.mockRejectedValueOnce(new Error('Failed to sign up'));
}; 