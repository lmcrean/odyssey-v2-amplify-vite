import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthComponent } from '../../../components/AuthComponent';
import { mockSignOut as mockAmplifySignOut } from '../../mocks/auth/amplify/ui-react/Authenticator';
import { deleteUser, updatePassword, updateUserAttributes } from 'aws-amplify/auth';
import { toast } from 'react-toastify';
import { performAuthFlow, authFlowSteps } from '../../utils/auth/flows';

// Mock Amplify UI components
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: any) => children({
    signOut: mockAmplifySignOut,
    user: { 
      username: 'testuser',
      attributes: {
        'custom:display_name': 'Test User'
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

// Mock toast
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
  ToastContainer: () => null,
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

  describe('Complex User Flows', () => {
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

    it('handles failed operations gracefully', async () => {
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
      expect(toast.error).toHaveBeenCalledTimes(2);
      expect(updateUserAttributes).toHaveBeenCalledTimes(2);
      expect(updatePassword).toHaveBeenCalledTimes(2);
      expect(mockAmplifySignOut).toHaveBeenCalled();
    });
  });
});
