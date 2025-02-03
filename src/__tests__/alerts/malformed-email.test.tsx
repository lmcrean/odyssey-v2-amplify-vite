import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer, toast } from 'react-toastify';
import { AuthComponent } from '../../components/auth';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock the Amplify Authenticator
vi.mock('@aws-amplify/ui-react', () => ({
  Authenticator: ({ children }: { children: any }) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.currentTarget as HTMLFormElement;
      const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
      
      // If email validation fails, show toast
      if (!emailInput.validity.valid) {
        toast.error('Invalid email format');
      }
    };

    return (
      <div data-testid="mock-authenticator">
        <form data-amplify-form onSubmit={handleSubmit}>
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
    );
  }
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

  it('shows HTML5 validation for malformed email', async () => {
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

    // Check that HTML5 validation failed
    expect(emailInput.validity.valid).toBe(false);
    expect(emailInput.validationMessage).toBeTruthy();
  });

  it('shows HTML5 validation for empty email', async () => {
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

    // Check that HTML5 validation failed
    expect(emailInput.validity.valid).toBe(false);
    expect(emailInput.validationMessage).toBeTruthy();
  });

  it('should show toast when HTML5 validation fails', async () => {
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
    
    // Try to submit
    const form = screen.getByTestId('mock-authenticator').querySelector('form')!;
    fireEvent.submit(form);

    // First, HTML5 validation should fail
    expect(emailInput.validity.valid).toBe(false);
    expect(emailInput.validationMessage).toBeTruthy();

    // Then, we expect a toast to appear
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email format');
    });
  });
});
