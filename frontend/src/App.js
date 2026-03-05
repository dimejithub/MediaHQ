import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile, signOut } from './lib/supabase';

// Pages
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import TeamDirectory from './pages/TeamDirectory';
import Services from './pages/Services';
import Equipment from './pages/Equipment';
import MyRotas from './pages/MyRotas';
import Checklists from './pages/Checklists';
import Calendar from './pages/Calendar';
import Attendance from './pages/Attendance';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AuthCallback from './pages/AuthCallback';
import DirectorDashboard from './pages/DirectorDashboard';

// Auth Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check for demo mode
    const isDemoMode = localStorage.getItem('demoMode') === 'true';
    if (isDemoMode) {
      setDemoMode(true);
      setProfile({
        name: 'Demo User',
        email: 'demo@tenmediahq.com',
        role: localStorage.getItem('demoRole') || 'member',
        primary_team: 'envoy_nation',
        teams: ['envoy_nation']
      });
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profileData } = await getProfile(session.user.id);
        setProfile(profileData);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profileData } = await getProfile(session.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('demoMode');
        localStorage.removeItem('demoRole');
        localStorage.removeItem('onboarding_complete');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const enableDemoMode = (role = 'member') => {
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoRole', role);
    setDemoMode(true);
    setProfile({
      name: 'Demo User',
      email: 'demo@tenmediahq.com',
      role: role,
      primary_team: 'envoy_nation',
      teams: ['envoy_nation']
    });
  };

  const handleSignOut = async () => {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoRole');
    localStorage.removeItem('onboarding_complete');
    setDemoMode(false);
    setProfile(null);
    setUser(null);
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      demoMode,
      enableDemoMode,
      signOut: handleSignOut,
      setProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Navigation items with role-based access
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', roles: ['all'] },
  { path: '/team', label: 'Team', icon: 'Users', roles: ['all'] },
  { path: '/services', label: 'Services', icon: 'Calendar', roles: ['all'] },
  { path: '/equipment', label: 'Equipment', icon: 'Package', roles: ['all'] },
  { path: '/rotas', label: 'Rotas', icon: 'ClipboardList', roles: ['all'] },
  { path: '/checklists', label: 'Checklists', icon: 'CheckSquare', roles: ['all'] },
  { path: '/calendar', label: 'Calendar', icon: 'CalendarDays', roles: ['all'] },
  { path: '/attendance', label: 'Attendance', icon: 'UserCheck', roles: ['all'] },
  { path: '/notifications', label: 'Notifications', icon: 'Bell', roles: ['all'] },
  { path: '/director', label: 'Director View', icon: 'Crown', roles: ['director'] },
  { path: '/settings', label: 'Settings', icon: 'Settings', roles: ['all'] },
];

// Icon component
function Icon({ name, className = "w-5 h-5" }) {
  const icons = {
    LayoutDashboard: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
    Users: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Calendar: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Package: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    ClipboardList: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    CheckSquare: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    CalendarDays: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    UserCheck: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    Bell: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
    Crown: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7l3-7z" /></svg>,
    Settings: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Menu: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>,
    X: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
    LogOut: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  };
  return icons[name] || null;
}

// Layout component with sidebar
function Layout({ children }) {
  const { profile, signOut, demoMode } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = profile?.role || 'member';
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes('all') || item.roles.includes(userRole)
  );

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
      >
        <Icon name={sidebarOpen ? 'X' : 'Menu'} />
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-slate-200 flex items-center justify-center text-slate-900 font-bold text-lg">
                TEN
              </div>
              <div>
                <span className="font-bold text-white block">MediaHQ</span>
                <span className="text-xs text-slate-400">Church Media System</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                data-testid={`nav-${item.path.slice(1)}`}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                  ${location.pathname === item.path 
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-slate-800">
            {demoMode && (
              <div className="mb-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full text-center">
                Demo Mode
              </div>
            )}
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                {profile?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{profile?.name || 'User'}</p>
                <p className="text-xs text-slate-400 capitalize">{userRole.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            >
              <Icon name="LogOut" className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { user, loading, demoMode, profile } = useAuth();
  const location = useLocation();
  
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
  
  // Simple localStorage check for onboarding
  const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true' || profile?.onboarding_completed;
  const isOnboardingPage = location.pathname === '/onboarding';
  
  // Redirect to onboarding if not completed (unless already on onboarding page)
  if (!onboardingComplete && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // If on onboarding page, don't wrap in Layout
  if (isOnboardingPage) {
    return children;
  }
  
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamDirectory /></ProtectedRoute>} />
          <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
          <Route path="/rotas" element={<ProtectedRoute><MyRotas /></ProtectedRoute>} />
          <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/director" element={<ProtectedRoute><DirectorDashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
export { AuthContext };
