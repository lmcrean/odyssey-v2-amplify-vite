import '@aws-amplify/ui-react/styles.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Authenticator } from '@aws-amplify/ui-react';
import { AuthComponentProps } from '../types/auth.types';
import { AuthenticatorContent } from './AuthenticatorContent';

// Add custom styles for the Amplify container
const customStyles = `
  [data-amplify-router] {
    background-color:rgb(27, 32, 105) !important;
    border-radius: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-width: 0 !important;
  }

  /*everything inside the router*/
  [data-amplify-router] > *, [data-amplify-router] > * > *, [data-amplify-router] > * > * > * {
    border-width: 0 !important;
  }

  .amplify-input {
    background-color: #16154ba1 !important;
    color:rgba(222, 222, 223, 0.89) !important;
  }

  label.amplify-label {
    color:rgba(222, 222, 223, 0.89) !important;
  }

  .amplify-tabs__item--active {
    background-color: #16154ba1 !important;
    color:rgba(222, 222, 223, 0.89) !important;
  }

  .amplify-tabs__item {
    background-color:rgba(34, 21, 75, 0.63) !important;
    color:rgba(222, 222, 223, 0.89) !important;
  }

  /* Password visibility toggle button styles */
  .amplify-field-group__outer-end button {
    background-color: transparent !important;
    border: none !important;
    color: rgba(222, 222, 223, 0.7) !important;
    padding: 0 8px !important;
    margin-left: -40px !important;
    z-index: 2 !important;
  }

  .amplify-field-group__outer-end button:hover {
    color: rgba(222, 222, 223, 0.9) !important;
    background-color: transparent !important;
  }

  /* Hide the button background and adjust the icon */
  .amplify-field-group__outer-end button > span {
    padding: 0 !important;
    background: none !important;
  }

  /* Ensure the password input has space for the icon */
  .amplify-field-group input[type="password"],
  .amplify-field-group input[type="text"] {
    padding-right: 40px !important;
  }

  .amplify-tabs__item:hover {
    background-color:rgba(24, 29, 88, 0.63) !important;
    color:rgba(228, 235, 206, 0.89) !important;
  }

  .amplify-tabs__list {
    border-style: none !important;
  }

  .amplify-tabs__item--active {
    border-bottom-width: 2px;
    border-top-width: 0;
    background-color:rgb(27, 32, 105) !important;
  }

  .amplify-tabs__item {
    border-top-width: 0 !important;
  }

  /* First tab (Sign In) */
  .amplify-tabs__list button:nth-child(1) {
    border-radius: 20px 0 0 0 !important;
  }

  /* Second tab (Create Account) */
  .amplify-tabs__list button:nth-child(2) {
    border-radius: 0 20px 0 0 !important;
  }

  .amplify-heading, .amplify-text {
    color: #d3e0bd;
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
          {(props) => (
            <AuthenticatorContent {...props} />
          )}
        </Authenticator>
      </div>
    </div>
  );
}; 