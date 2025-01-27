import { vi } from 'vitest';
import { AuthUser } from '../../types/auth.types';

export const mockGetCurrentUser = vi.fn((): Promise<AuthUser> => {
  return Promise.resolve({
    username: 'testuser',
    userId: 'test-user-id',
  });
});

export const mockGetCurrentUserError = () => {
  mockGetCurrentUser.mockRejectedValueOnce(new Error('Failed to get current user'));
}; 