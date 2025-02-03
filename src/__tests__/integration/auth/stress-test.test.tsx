import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthComponent } from '../../../components/auth';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';
import { deleteUser, updatePassword, updateUserAttributes } from 'aws-amplify/auth';
import { performAuthFlow, authFlowSteps } from '../../utils/auth/flows';
import { UpdateUserAttributesOutput } from 'aws-amplify/auth';

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: any) => children({
    signOut: mockAmplifySignOut,
    user: { 
      username: 'testuser',
      attributes: {
        'givenName': 'Test User'
      }
    }
  })
}));

// Mock Amplify Auth
vi.mock('aws-amplify/auth', () => ({
  deleteUser: vi.fn(),
  updatePassword: vi.fn(),
  updateUserAttributes: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue({ username: 'testuser' })
}));

describe('Auth Stress Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    render(<AuthComponent authStatus="authenticated" />);
  });

  afterEach(() => {
    cleanup();
  });

  describe('Basic User Flows', () => {
    it('handles signup -> login -> change username -> change password -> logout -> login -> delete account', async () => {
      const flow = {
        name: 'Full user lifecycle flow',
        steps: [
          authFlowSteps.signup,
          authFlowSteps.login,
          authFlowSteps.changeUsername,
          authFlowSteps.changePassword,
          authFlowSteps.logout,
          authFlowSteps.login,
          authFlowSteps.deleteAccount
        ]
      };

      await performAuthFlow(flow);

      // Verify the final state
      expect(deleteUser).toHaveBeenCalled();
      expect(mockAmplifySignOut).toHaveBeenCalled();
    });

    it('handles login -> multiple profile updates -> logout', async () => {
      const flow = {
        name: 'Multiple profile updates flow',
        steps: [
          authFlowSteps.login,
          authFlowSteps.changeUsername,
          authFlowSteps.changePassword,
          authFlowSteps.changeUsername,
          authFlowSteps.changePassword,
          authFlowSteps.logout
        ]
      };

      await performAuthFlow(flow);

      // Verify multiple updates were performed
      expect(updateUserAttributes).toHaveBeenCalledTimes(2);
      expect(updatePassword).toHaveBeenCalledTimes(2);
      expect(mockAmplifySignOut).toHaveBeenCalled();
    });
  });

  describe('Error Handling Flows', () => {
    it('handles basic error flow with recovery', async () => {
      // Mock failures
      vi.mocked(updateUserAttributes).mockRejectedValueOnce(new Error('Failed to update display name'));
      vi.mocked(updatePassword).mockRejectedValueOnce(new Error('Failed to update password'));
      
      const flow = {
        name: 'Error handling flow',
        steps: [
          authFlowSteps.login,
          authFlowSteps.changeUsername, // This will fail
          authFlowSteps.changePassword, // This will fail
          authFlowSteps.changeUsername, // This should still work
          authFlowSteps.changePassword, // This should still work
          authFlowSteps.logout
        ]
      };

      await performAuthFlow(flow);

      // Verify error handling
      expect(updateUserAttributes).toHaveBeenCalledTimes(2);
      expect(updatePassword).toHaveBeenCalledTimes(2);
      expect(mockAmplifySignOut).toHaveBeenCalled();
    });

    it('handles alternating success/failure pattern', async () => {
      // Mock alternating failures
      vi.mocked(updateUserAttributes)
        .mockResolvedValueOnce({} as UpdateUserAttributesOutput) // First call succeeds
        .mockRejectedValueOnce(new Error('Mock error')) // Second call fails
        .mockResolvedValueOnce({} as UpdateUserAttributesOutput); // Third call succeeds

      vi.mocked(updatePassword)
        .mockRejectedValueOnce(new Error('Failed to update password')) // First call fails
        .mockResolvedValueOnce(undefined) // Second call succeeds
        .mockRejectedValueOnce(new Error('Failed to update password')); // Third call fails

      const flow = {
        name: 'Alternating success/failure flow',
        steps: [
          authFlowSteps.changeUsername, // Success
          authFlowSteps.changePassword, // Fail
          authFlowSteps.changeUsername, // Fail
          authFlowSteps.changePassword, // Success
          authFlowSteps.changeUsername, // Success
          authFlowSteps.changePassword  // Fail
        ]
      };

      await performAuthFlow(flow);

      expect(updateUserAttributes).toHaveBeenCalledTimes(3);
      expect(updatePassword).toHaveBeenCalledTimes(3);
    });

    it('handles cascading failures with delete account', async () => {
      // Mock cascading failures
      vi.mocked(updateUserAttributes).mockRejectedValue(new Error('Failed to update display name'));
      vi.mocked(updatePassword).mockRejectedValue(new Error('Failed to update password'));
      vi.mocked(deleteUser).mockRejectedValueOnce(new Error('Failed to delete account'));

      const flow = {
        name: 'Cascading failures flow',
        steps: [
          authFlowSteps.changeUsername, // Fail
          authFlowSteps.changePassword, // Fail
          authFlowSteps.deleteAccount,  // Fail first time
          authFlowSteps.deleteAccount   // Should succeed second time
        ]
      };

      await performAuthFlow(flow);

      expect(updateUserAttributes).toHaveBeenCalledTimes(1);
      expect(updatePassword).toHaveBeenCalledTimes(1);
      expect(deleteUser).toHaveBeenCalledTimes(2);
    });

    it('handles mixed operation flow with partial failures', async () => {
      // Mock specific failures
      vi.mocked(updateUserAttributes)
        .mockResolvedValueOnce({} as UpdateUserAttributesOutput) // First username change succeeds
        .mockRejectedValueOnce(new Error('Failed to update display name')); // Second username change fails

      vi.mocked(updatePassword)
        .mockRejectedValueOnce(new Error('Failed to update password')) // First password change fails
        .mockResolvedValue(undefined); // Second password change succeeds

      vi.mocked(deleteUser).mockResolvedValue(undefined);
      
      const flow = {
        name: 'Mixed operations with partial failures',
        steps: [
          authFlowSteps.login,
          authFlowSteps.changeUsername, // Success
          authFlowSteps.changePassword, // Fail
          authFlowSteps.logout,
          authFlowSteps.login,
          authFlowSteps.changeUsername, // Fail
          authFlowSteps.changePassword, // Success
          authFlowSteps.deleteAccount   // Success
        ]
      };

      await performAuthFlow(flow);

      expect(updateUserAttributes).toHaveBeenCalledTimes(2);
      expect(updatePassword).toHaveBeenCalledTimes(2);
      expect(deleteUser).toHaveBeenCalledTimes(1);
      expect(mockAmplifySignOut).toHaveBeenCalledTimes(2); // Called after logout and delete account
    });
  });
});
