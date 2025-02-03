import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer, toast } from 'react-toastify';
import { AuthComponent } from '../../components/auth';
import { useAuthError } from '../../components/auth/hooks/useAuthError';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the Amplify Authenticator
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: { children: any }) => (
    <div data-testid="mock-authenticator">
      <form data-amplify-form>
        <input
          type="email"
          name="username"
          placeholder="Email"
          aria-label="Email"
          data-testid="email-input"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          aria-label="Password"
          data-testid="password-input"
          required
        />
        <button type="submit" data-testid="sign-in-button">
          Sign in
        </button>
      </form>
      {children && children({ signOut: () => {}, user: null })}
    </div>
  )
}));

// Mock the auth error hook
vi.mock('../../components/auth/hooks/useAuthError', () => ({
  useAuthError: () => ({
    handleAuthError: vi.fn(),
    showError: vi.fn()
  })
}));

// Mock the toast library
vi.mock('react-toastify', async () => {
  const actual = await vi.importActual('react-toastify');
  return {
    ...actual,
    toast: {
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn()
    }
  };
});

describe('Malformed Email Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation message for malformed email', async () => {
    // Render the component
    render(
      <>
        <ToastContainer />
        <AuthComponent />
      </>
    );

    // Get the email input
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    
    // Type an invalid email
    await userEvent.type(emailInput, 'not-an-email');
    
    // Try to submit (this will trigger HTML5 validation)
    await userEvent.click(screen.getByTestId('sign-in-button'));

    // Check that validation failed
    expect(emailInput.validity.valid).toBe(false);
    expect(emailInput.validationMessage).toBeTruthy();
  });

  it('shows validation message for empty email', async () => {
    // Render the component
    render(
      <>
        <ToastContainer />
        <AuthComponent />
      </>
    );

    // Get the email input
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;
    
    // Try to submit without entering an email
    await userEvent.click(screen.getByTestId('sign-in-button'));

    // Check that validation failed
    expect(emailInput.validity.valid).toBe(false);
    expect(emailInput.validationMessage).toBeTruthy();
  });
});
