// Auth state manager
let currentAuthStatus = 'authenticated';

export const getAuthStatus = () => currentAuthStatus;
export const setAuthStatus = (status: 'authenticated' | 'unauthenticated') => {
  currentAuthStatus = status;
}; 