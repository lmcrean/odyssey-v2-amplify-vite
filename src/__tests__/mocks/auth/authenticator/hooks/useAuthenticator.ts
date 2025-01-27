import { useAuthContext } from '../context/AuthContext';
import { mockSignOut } from '../../amplify/authentication/signOut';
import { mockSignUp } from '../../amplify/registration/signUp';
import { mockConfirmSignUp } from '../../amplify/registration/confirmSignUp';
import { mockGetCurrentUser } from '../../amplify/user/getCurrentUser';

export const useAuthenticator = (selector?: (context: any) => any) => {
  const context = useAuthContext();
  const isAuthenticated = context.authStatus === 'authenticated';

  const extendedContext = {
    ...context,
    signOut: mockSignOut,
    signUp: mockSignUp,
    confirmSignUp: mockConfirmSignUp,
    getCurrentUser: mockGetCurrentUser,
    user: isAuthenticated ? { username: 'testuser', userId: 'test-user-id' } : null,
    hasValidationErrors: false,
    validationErrors: {},
    isPending: false,
    route: isAuthenticated ? 'authenticated' : 'signIn',
    updateAuthStatus: context.setAuthStatus,
    updateCredentials: () => {},
    submitForm: () => {},
    toFederatedSignIn: () => {},
    toResetPassword: () => {},
    updateBlur: () => {},
    updateFormState: () => {},
    updateTouchStatus: () => {},
    resendCode: () => {},
    skip: () => {},
    getTouchStatus: () => {},
    handleBlur: () => {},
    handleChange: () => {},
    handleSubmit: () => {},
    initializeMachine: () => {},
    fields: {},
    QRFields: {},
    updateForm: () => {},
    toForgotPassword: () => {},
    skipVerification: () => {},
    challengeName: undefined,
    codeDeliveryDetails: { AttributeName: '', DeliveryMedium: '', Destination: '' },
    error: '',
    forgotPassword: { delivery: null, username: '' },
    username: ''
  };

  if (selector) {
    return selector(extendedContext);
  }

  return extendedContext;
}; 