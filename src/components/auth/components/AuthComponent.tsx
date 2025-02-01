import '@aws-amplify/ui-react/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { AuthComponentProps } from '../types/auth.types';
import { AuthenticatorContent } from './AuthenticatorContent';

// Add custom styles for the Amplify container
const customStyles = `
  [data-amplify-router] {
    background-color: #2D1B69 !important;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
`;

export const AuthComponent: React.FC<AuthComponentProps> = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <style>{customStyles}</style>
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
        theme="dark"
      />
      <div className="w-full max-w-md">
        <Authenticator>
          {(props) => <AuthenticatorContent {...props} />}
        </Authenticator>
      </div>
    </div>
  );
}; 