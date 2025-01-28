import { fireEvent, screen, act } from '@testing-library/react';

export type AuthFlow = {
  name: string;
  steps: Array<() => Promise<void>>;
};

export const performAuthFlow = async (flow: AuthFlow) => {
  console.log(`Starting auth flow: ${flow.name}`);
  for (const step of flow.steps) {
    await step();
  }
  console.log(`Completed auth flow: ${flow.name}`);
};

export const authFlowSteps = {
  signup: async () => {
    // Signup steps would go here in a real implementation
    console.log('Signup step');
  },

  login: async () => {
    // Login steps would go here in a real implementation
    console.log('Login step');
  },

  logout: async () => {
    const signOutButton = screen.getByRole('button', { name: /sign out/i });
    await act(async () => {
      await fireEvent.click(signOutButton);
    });
  },

  changeUsername: async () => {
    // Open change display name modal
    const changeDisplayNameButton = screen.getByTestId('open-change-display-name-modal');
    await act(async () => {
      await fireEvent.click(changeDisplayNameButton);
    });

    // Fill in the form
    const displayNameInput = screen.getByLabelText(/new display name/i);
    await act(async () => {
      await fireEvent.change(displayNameInput, { target: { value: 'New Display Name' } });
    });

    // Submit the form
    const submitButton = screen.getByTestId('submit-change-display-name');
    await act(async () => {
      await fireEvent.click(submitButton);
    });
  },

  changePassword: async () => {
    // Open change password modal
    const changePasswordButton = screen.getByTestId('open-change-password-modal');
    await act(async () => {
      await fireEvent.click(changePasswordButton);
    });

    // Fill in the form
    const oldPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmNewPasswordInput = screen.getByLabelText(/confirm new password/i);

    await act(async () => {
      await fireEvent.change(oldPasswordInput, { target: { value: 'oldPass123' } });
      await fireEvent.change(newPasswordInput, { target: { value: 'newPass123' } });
      await fireEvent.change(confirmNewPasswordInput, { target: { value: 'newPass123' } });
    });

    // Submit the form
    const submitButton = screen.getByTestId('submit-change-password');
    await act(async () => {
      await fireEvent.click(submitButton);
    });
  },

  deleteAccount: async () => {
    // Open delete modal using data-testid
    const deleteButton = screen.getByTestId('open-delete-account-modal');
    await act(async () => {
      await fireEvent.click(deleteButton);
    });

    // Confirm deletion using data-testid
    const confirmButton = screen.getByTestId('confirm-delete-account');
    await act(async () => {
      await fireEvent.click(confirmButton);
    });
  }
};
