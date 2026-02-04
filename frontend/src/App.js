import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
// import TeamDirectory from '@/pages/TeamDirectory';
import Services from '@/pages/Services';
import MyRotas from '@/pages/MyRotas';
import Equipment from '@/pages/Equipment';
import Training from '@/pages/Training';
import Settings from '@/pages/Settings';
// import Layout from '@/components/Layout';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function AuthCallback() {
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const hash = window.location.hash;
    if (!hash.includes('session_id=')) return;

    const params = new URLSearchParams(hash.substring(1));
    const sessionId = params.get('session_id');
    if (!sessionId) return;

    fetch(`${BACKEND_URL}/api/auth/session`, {
      method: 'POST',
      headers: { 'X-Session-ID': sessionId },
      credentials: 'include'
    })
      .then(res => res.json())
      .then(() => {
        window.location.href = '/dashboard';
      })
      .catch(() => {
        window.location.href = '/login';
      });
  }, []);

  return <div className="flex items-center justify-center min-h-screen">Processing authentication...</div>;
}

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Not authenticated');
        const userData = await response.json();
        setIsAuthenticated(true);
        setUser(userData);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRouter() {
  const location = useLocation();

  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><TeamDirectory /></ProtectedRoute>} />
      <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
      <Route path="/my-rotas" element={<ProtectedRoute><MyRotas /></ProtectedRoute>} />
      <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
      <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;