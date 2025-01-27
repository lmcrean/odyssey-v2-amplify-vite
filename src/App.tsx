import AuthComponent from './components/AuthComponent';
import TailwindTest from './components/TailwindTest';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" />
        <Routes>
          <Route path="/" element={<AuthComponent />} />
          <Route path="/tailwind-test" element={<TailwindTest />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
