import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
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
import LeadRotation from '@/pages/LeadRotation';
import Performance from '@/pages/Performance';
import Calendar from '@/pages/Calendar';
import DirectorDashboard from '@/pages/DirectorDashboard';
import Attendance from '@/pages/Attendance';
import Onboarding from '@/pages/Onboarding';
import Notifications from '@/pages/Notifications';
import '@/App.css';

// Auth Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    return localStorage.getItem('selectedTeam') || 'envoy_nation';
  });
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem('demoMode') === 'true';
  });
  const [demoRole, setDemoRole] = useState(() => {
    return localStorage.getItem('demoRole') || 'director';
  });
  const [isWeeklyLead, setIsWeeklyLead] = useState(false);

  const roleAccess = {
    director: ['all'],
    admin: ['all'],
    team_lead: ['dashboard', 'calendar', 'attendance', 'team', 'services', 'assign-rotas', 'my-rotas', 'lead-rotation', 'equipment', 'checklists', 'reports', 'performance', 'training', 'settings', 'notifications'],
    assistant_lead: ['dashboard', 'calendar', 'attendance', 'team', 'services', 'assign-rotas', 'my-rotas', 'lead-rotation', 'equipment', 'checklists', 'reports', 'performance', 'training', 'settings', 'notifications'],
    unit_head: ['dashboard', 'calendar', 'attendance', 'team', 'services', 'assign-rotas', 'my-rotas', 'equipment', 'checklists', 'reports', 'training', 'notifications'],
    member: ['dashboard', 'calendar', 'attendance', 'team', 'my-rotas', 'training', 'performance', 'reports', 'notifications']
  };

  const hasAccess = (path) => {
    const userRole = profile?.role || user?.role || 'member';
    let access = roleAccess[userRole] || roleAccess.member;
    if (userRole === 'member' && isWeeklyLead) access = [...access, 'checklists'];
    if (access.includes('all')) return true;
    const cleanPath = path.replace('/', '').replace('/','');
    return access.includes(cleanPath) || cleanPath === '' || cleanPath === 'login';
  };

  // Load profile from Supabase profiles table
  const loadProfile = async (authUser) => {
    if (!authUser) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error || !data) {
        // Profile doesn't exist yet — create one from Google/email data
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Team Member',
          role: 'member',
          team: 'envoy_nation',
          avatar_url: authUser.user_metadata?.avatar_url || null,
          onboarding_complete: false,
          created_at: new Date().toISOString()
        };
        const { data: created } = await supabase.from('profiles').upsert(newProfile).select().single();
        return created || newProfile;
      }
      return data;
    } catch (err) {
      console.error('Profile load error:', err);
      return null;
    }
  };

  useEffect(() => {
    if (demoMode) {
      setupDemoUser(demoRole);
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const p = await loadProfile(session.user);
        setProfile(p);
      }
      setLoading(false);
    });

    // Listen for auth changes — this is the key for session persistence
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        const p = await loadProfile(session.user);
        setProfile(p);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [demoMode, demoRole]);

  const setupDemoUser = (role) => {
    const roleNames = {
      director: 'Dr. Adebowale Owoseni',
      team_lead: 'Adeola Hilton',
      assistant_lead: 'Oladimeji Tiamiyu',
      unit_head: 'Michel Adimula',
      member: 'Jasper Eromon'
    };
    const demoUser = {
      id: `demo_${role}`,
      email: 'demo@mediahq.com',
      name: roleNames[role] || 'Demo User',
      role,
      team: 'envoy_nation',
      teams: ['envoy_nation', 'e_nation'],
      onboarding_complete: true
    };
    setUser(demoUser);
    setProfile(demoUser);
    if (role === 'member') setIsWeeklyLead(true);
  };

  const logout = async () => {
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoRole');
    localStorage.removeItem('selectedTeam');
    setDemoMode(false);
    setUser(null);
    setProfile(null);
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const enableDemoMode = (role = 'director') => {
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoRole', role);
    setDemoMode(true);
    setDemoRole(role);
    setupDemoUser(role);
  };

  const switchDemoRole = (role) => {
    localStorage.setItem('demoRole', role);
    setDemoRole(role);
    enableDemoMode(role);
  };

  const switchTeam = (teamId) => {
    localStorage.setItem('selectedTeam', teamId);
    setSelectedTeam(teamId);
  };

  const updateProfile = async (updates) => {
    if (!user || demoMode) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  const fetchNotifications = async () => {
    if (demoMode || !user) return;
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const markAllRead = async () => {
    if (demoMode) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      return;
    }
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    fetchNotifications();
  };

  // Combine auth user + profile for convenient access
  const currentUser = profile ? {
    ...profile,
    email: user?.email,
    avatar_url: profile.avatar_url || user?.user_metadata?.avatar_url,
  } : (user ? { id: user.id, email: user.email, name: user.email?.split('@')[0], role: 'member' } : null);

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      supabaseUser: user,
      profile,
      loading,
      logout,
      demoMode,
      enableDemoMode,
      updateProfile,
      notifications,
      unreadCount,
      fetchNotifications,
      markAllRead,
      selectedTeam,
      switchTeam,
      hasAccess,
      switchDemoRole,
      isWeeklyLead
    }}>
      {children}
    </AuthContext.Provider>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const { user, logout, demoMode, notifications, unreadCount, markAllRead, selectedTeam, switchTeam, hasAccess, switchDemoRole } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDirector = user?.role === 'director' || user?.role === 'admin';

  const roleLabels = {
    director: 'Director',
    team_lead: 'Team Lead',
    assistant_lead: 'Assistant Lead',
    unit_head: 'Unit Head',
    member: 'Member'
  };

  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', access: 'dashboard' },
    { name: 'Director View', path: '/director', icon: '👁️', access: 'director', directorOnly: true },
    { name: 'Calendar', path: '/calendar', icon: '📅', access: 'calendar' },
    { name: 'Attendance', path: '/attendance', icon: '✋', access: 'attendance' },
    { name: 'Team', path: '/team', icon: '👥', access: 'team' },
    { name: 'Services', path: '/services', icon: '🗓️', access: 'services' },
    { name: 'Assign Rotas', path: '/assign-rotas', icon: '📝', access: 'assign-rotas' },
    { name: 'My Rotas', path: '/my-rotas', icon: '✅', access: 'my-rotas' },
    { name: 'Lead Rotation', path: '/lead-rotation', icon: '🔄', access: 'lead-rotation' },
    { name: 'Equipment', path: '/equipment', icon: '🎥', access: 'equipment' },
    { name: 'Checklists', path: '/checklists', icon: '📋', access: 'checklists' },
    { name: 'Reports', path: '/reports', icon: '📄', access: 'reports' },
    { name: 'Performance', path: '/performance', icon: '📈', access: 'performance' },
    { name: 'Training', path: '/training', icon: '🎓', access: 'training' },
    { name: 'Our Mission', path: '/onboarding', icon: '💫', access: 'dashboard' },
    { name: 'Settings', path: '/settings', icon: '⚙️', access: 'settings' }
  ];

  const navItems = allNavItems.filter(item => {
    if (item.directorOnly && !isDirector) return false;
    return hasAccess(item.access);
  });

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 -ml-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-sm text-slate-900">TEN</div>
          <span className="font-bold text-white">MediaHQ</span>
        </div>
        <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-white">
          <span className="text-xl">🔔</span>
          {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
        </button>
      </div>

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex-shrink-0 p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-lg text-slate-900">TEN</div>
            <div>
              <h1 className="font-bold text-lg text-white">MediaHQ</h1>
              <p className="text-xs text-slate-400">Church Media System</p>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-4 pt-4 space-y-2">
          <select value={selectedTeam} onChange={(e) => switchTeam(e.target.value)} className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500">
            <option value="envoy_nation">🔵 Envoy Nation</option>
            <option value="e_nation">🟢 E-Nation</option>
          </select>

          <div className="relative">
            <button onClick={() => setShowNotifications(!showNotifications)} className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all">
              <span className="text-sm text-slate-300">🔔 Notifications</span>
              {unreadCount > 0 && <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-50 max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Notifications</span>
                  {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-blue-400">Mark all read</button>}
                </div>
                {notifications && notifications.length > 0 ? notifications.slice(0, 5).map(n => (
                  <div key={n.id || n.notification_id} className={`p-3 border-b border-slate-700 last:border-0 ${!n.read ? 'bg-slate-700/50' : ''}`}>
                    <p className="text-sm font-medium text-white">{n.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                  </div>
                )) : <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>}
              </div>
            )}
          </div>

          {demoMode && (
            <div className="relative">
              <button onClick={() => setShowRoleSelector(!showRoleSelector)} className="w-full px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-all">
                <p className="text-xs text-amber-400 font-medium text-center">Demo: {roleLabels[user?.role] || 'Director'} ▼</p>
              </button>
              {showRoleSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-50">
                  <p className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">Switch Demo Role:</p>
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <button key={role} onClick={() => { switchDemoRole(role); setShowRoleSelector(false); }} className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-all ${user?.role === role ? 'bg-slate-700 text-white' : 'text-slate-300'}`}>{label}</button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex-shrink-0 p-4 border-t border-slate-800">
          {user && (
            <div className="mb-3 flex items-center gap-3">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button onClick={logout} className="w-full px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-left">Logout</button>
          <div className="mt-2 text-xs text-slate-600 text-center">© 2026 TEN MediaHQ</div>
        </div>
      </div>

      <main className="flex-1 overflow-auto bg-slate-950 pt-16 lg:pt-0">{children}</main>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading, demoMode, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-bold text-slate-900 text-lg mx-auto mb-4">TEN</div>
          <div className="text-white text-lg animate-pulse">Loading MediaHQ...</div>
        </div>
      </div>
    );
  }

  if (!user && !demoMode) {
    return <Navigate to="/login" replace />;
  }

  const isOnboardingPage = location.pathname === '/onboarding';
  const onboardingComplete = profile?.onboarding_complete === true || localStorage.getItem('onboarding_complete') === 'true' || demoMode;

  if (!onboardingComplete && !isOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }

  if (isOnboardingPage) return children;

  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/director" element={<ProtectedRoute><DirectorDashboard /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><TeamDirectory /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/assign-rotas" element={<ProtectedRoute><AssignRotas /></ProtectedRoute>} />
            <Route path="/my-rotas" element={<ProtectedRoute><MyRotas /></ProtectedRoute>} />
            <Route path="/lead-rotation" element={<ProtectedRoute><LeadRotation /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><Equipment /></ProtectedRoute>} />
            <Route path="/checklists" element={<ProtectedRoute><Checklists /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ServiceReports /></ProtectedRoute>} />
            <Route path="/performance" element={<ProtectedRoute><Performance /></ProtectedRoute>} />
            <Route path="/training" element={<ProtectedRoute><Training /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
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
