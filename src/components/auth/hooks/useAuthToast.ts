import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const useAuthToast = (user: any) => {
  const [hasShownSignInToast, setHasShownSignInToast] = useState(false);

  useEffect(() => {
    if (user && !hasShownSignInToast) {
      toast.success('Successfully signed in', { autoClose: 3000 });
      setHasShownSignInToast(true);
    }
  }, [user, hasShownSignInToast]);

  return { hasShownSignInToast };
}; 