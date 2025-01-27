import AuthComponent from './components/AuthComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />
      <AuthComponent />
    </div>
  );
}

export default App;
