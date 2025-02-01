import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

export const useAuthToast = (user: any) => {
  const hasShownSignInToastRef = useRef(false);

  useEffect(() => {
    if (user && !hasShownSignInToastRef.current) {
      toast.success('Successfully signed in', { autoClose: 3000 });
      hasShownSignInToastRef.current = true;
    }
  }, [user]);

  return { hasShownSignInToast: hasShownSignInToastRef.current };
}; 