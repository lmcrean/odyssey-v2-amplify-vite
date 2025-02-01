import '@aws-amplify/ui-react/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { AuthComponentProps } from '../types/auth.types';
import { AuthenticatorContent } from './AuthenticatorContent';

export const AuthComponent: React.FC<AuthComponentProps> = () => {
  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Authenticator>
        {(props) => <AuthenticatorContent {...props} />}
      </Authenticator>
    </>
  );
}; 