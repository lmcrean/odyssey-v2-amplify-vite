import { useCallback } from 'react';
import { toast } from 'react-toastify';

export const useAuthError = () => {
  console.log('useAuthError hook initialized');

  const handleAuthError = useCallback((error: any) => {
    console.log('handleAuthError called with:', error);

    // Extract error message
    const errorMessage = error?.message || 'An unknown error occurred';
    console.log('Extracted error message:', errorMessage);

    // Handle specific error types
    if (errorMessage.includes('InvalidEmailFormatException') || 
        errorMessage.includes('Invalid email format')) {
      console.log('Showing invalid email format toast');
      toast.error('Invalid email format', { autoClose: 3000 });
    } else if (errorMessage.includes('UserNotFoundException') || 
               errorMessage.includes('User does not exist')) {
      console.log('Showing user not found toast');
      toast.error('User does not exist', { autoClose: 3000 });
    } else if (errorMessage.includes('NotAuthorizedException') || 
               errorMessage.includes('Incorrect username or password')) {
      console.log('Showing incorrect credentials toast');
      toast.error('Incorrect username or password', { autoClose: 3000 });
    } else if (errorMessage.includes('UsernameExistsException') || 
               errorMessage.includes('already exists')) {
      console.log('Showing account exists toast');
      toast.error('An account with this email already exists', { autoClose: 3000 });
    } else if (errorMessage.includes('InvalidPasswordException') || 
               errorMessage.includes('Password does not meet requirements')) {
      console.log('Showing invalid password toast');
      toast.error('Password must be at least 8 characters and contain uppercase, lowercase, numbers and special characters', { autoClose: 5000 });
    } else {
      // Generic error message for unhandled cases
      console.log('Showing generic error toast');
      toast.error(errorMessage, { autoClose: 3000 });
    }
  }, []);

  return { handleAuthError, showError: handleAuthError };
}; 