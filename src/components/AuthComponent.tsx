import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AuthComponent() {
  const { signOut, toSignIn } = useAuthenticator();

  const handleSignOut = async () => {
    try {
      toast.info('Signing out...', { autoClose: 2000 });
      await signOut();
      toast.success('Successfully signed out!', { autoClose: 2000 });
      toSignIn();
    } catch (error) {
      toast.error('Failed to sign out. Please try again.', { autoClose: 3000 });
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="p-4">
      <ToastContainer position="top-right" />
      <h1 className="text-2xl font-bold mb-4">Hello, authenticated user!</h1>
      <button
        onClick={handleSignOut}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Sign Out
      </button>
    </div>
  );
}

export default withAuthenticator(AuthComponent); 