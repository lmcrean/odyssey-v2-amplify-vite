import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

function AuthComponent() {
  return (
    <div>
      <h1>Hello, authenticated user!</h1>
    </div>
  );
}

export default withAuthenticator(AuthComponent); 