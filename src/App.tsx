import { useState, useEffect } from 'react';
import { AuthComponent } from './components/auth';
import { getCurrentUser } from 'aws-amplify/auth';
import { AuthStatus } from './__tests__/mocks/auth/types/auth.types';
import TailwindTest from './components/TailwindTest';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('unauthenticated');

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await getCurrentUser();
        setAuthStatus('authenticated');
      } catch (error) {
        setAuthStatus('unauthenticated');
      }
    };

    checkAuthStatus();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" />
        <Routes>
          <Route path="/" element={<AuthComponent authStatus={authStatus} />} />
          <Route path="/tailwind-test" element={<TailwindTest />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
