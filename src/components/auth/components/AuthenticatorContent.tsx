import { AuthenticatorContentProps } from '../types/auth.types';
import { AuthenticatedContent } from './AuthenticatedContent';
import { useAuthToast } from '../hooks/useAuthToast';

export const AuthenticatorContent: React.FC<AuthenticatorContentProps> = ({ signOut, user }) => {
  useAuthToast(user);

  if (!user || !signOut) return null;

  return <AuthenticatedContent signOut={signOut} user={user} />;
}; 