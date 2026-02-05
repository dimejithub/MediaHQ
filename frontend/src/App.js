import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { createContext, useContext, useState, useEffect } from 'react';
import Dashboard from '@/pages/Dashboard';
import TeamDirectory from '@/pages/TeamDirectory';
import Services from '@/pages/Services';
import AssignRotas from '@/pages/AssignRotas';
import MyRotas from '@/pages/MyRotas';
import Equipment from '@/pages/Equipment';
import Checklists from '@/pages/Checklists';
import ServiceReports from '@/pages/ServiceReports';
import Training from '@/pages/Training';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    } catch (err) {
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error');
    }
    setUser(null);
    window.location.href = '/login';
  };

  const enableDemoMode = () => {
    setDemoMode(true);
    setUser({ 
      user_id: 'demo_admin', 
      name: 'Demo Admin', 
      email: 'demo@mediahq.com', 
      role: 'admin',
      skills: ['Camera', 'Sound', 'Lighting']
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, demoMode, enableDemoMode, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const { user, logout, demoMode } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Team', path: '/team', icon: '👥' },
    { name: 'Services', path: '/services', icon: '🗓️' },
    { name: 'Assign Rotas', path: '/assign-rotas', icon: '📝' },
    { name: 'My Rotas', path: '/my-rotas', icon: '✅' },
    { name: 'Equipment', path: '/equipment', icon: '🎥' },
    { name: 'Checklists', path: '/checklists', icon: '📋' },
    { name: 'Reports', path: '/reports', icon: '📄' },
    { name: 'Training', path: '/training', icon: '🎓' },
    { name: 'Settings', path: '/settings', icon: '⚙️' }
  ];

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-lg text-slate-900">TEN</div>
            <div>
              <h1 className="font-bold text-lg text-white">MediaHQ</h1>
              <p className="text-xs text-slate-400">Church Media System</p>
            </div>
          </div>
        </div>

        {/* Demo Mode Banner */}
        {demoMode && (
          <div className="mx-4 mt-4 px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-xs text-amber-400 font-medium text-center">Demo Mode Active</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          {user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            data-testid="logout-btn"
            className="w-full px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-left"
          >
            Logout
          </button>
          <div className="mt-3 text-xs text-slate-600 text-center">
            © 2026 TEN MediaHQ
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950">{children}</main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, demoMode } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }
  
  if (!user && !demoMode) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><TeamDirectory /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/assign-rotas" element={<ProtectedRoute><AssignRotas /></ProtectedRoute>} />
            <Route path="/my-rotas" element={<ProtectedRoute><MyRotas /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
            <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ServiceReports /></ProtectedRoute>} />
            <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
export { AuthContext };