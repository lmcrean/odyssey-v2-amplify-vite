export interface AuthUser {
  username: string;
  userId: string;
}

export interface SignUpInput {
  username: string;
  password: string;
}

export interface SignInInput {
  username: string;
  password: string;
}

export interface SignUpOutput {
  userId: string;
  isSignUpComplete: boolean;
  nextStep: {
    signUpStep: string;
  };
}

export interface SignInOutput {
  isSignedIn: boolean;
  nextStep: {
    signInStep: string;
  };
}

export interface CodeDeliveryDetails {
  AttributeName: string;
  DeliveryMedium: string;
  Destination: string;
}

export type AuthStatus = 'authenticated' | 'unauthenticated';
export type AuthRoute = 'signIn' | 'signUp' | 'authenticated' | 'forgotPassword';

export interface AuthComponentProps {
  authStatus?: AuthStatus;
} 