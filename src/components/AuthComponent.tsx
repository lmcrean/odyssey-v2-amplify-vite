import { withAuthenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function AuthComponent() {
  const { signOut, toSignIn } = useAuthenticator();

  const handleSignOut = async () => {
    await signOut();
    toSignIn();
  };

  return (
    <div className="p-4">
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