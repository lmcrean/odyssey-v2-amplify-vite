import { AuthStatus } from '../../../__tests__/mocks/auth/types/auth.types';

export interface AuthComponentProps {
  authStatus?: AuthStatus;
}

export interface AuthenticatedContentProps {
  signOut: () => void;
  user: {
    username: string;
    signInDetails?: {
      loginId?: string;
    };
  };
}

export interface AuthenticatorContentProps {
  signOut?: () => void;
  user?: {
    username: string;
    signInDetails?: {
      loginId?: string;
    };
  };
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
} 