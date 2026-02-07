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
import LeadRotation from '@/pages/LeadRotation';
import Performance from '@/pages/Performance';
import Calendar from '@/pages/Calendar';
import DirectorDashboard from '@/pages/DirectorDashboard';
import Attendance from '@/pages/Attendance';
import '@/App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  // Role-based access configuration
  // Weekly lead is dynamic - members get checklist access when assigned as lead
  // Calendar is accessible to everyone for availability planning
  const roleAccess = {
    director: ['all'], // Access to everything
    admin: ['all'],
    team_lead: ['dashboard', 'calendar', 'team', 'services', 'assign-rotas', 'my-rotas', 'lead-rotation', 'equipment', 'checklists', 'reports', 'performance', 'training', 'settings'],
    assistant_lead: ['dashboard', 'calendar', 'team', 'services', 'assign-rotas', 'my-rotas', 'lead-rotation', 'equipment', 'checklists', 'reports', 'performance', 'training', 'settings'],
    unit_head: ['dashboard', 'calendar', 'team', 'services', 'assign-rotas', 'my-rotas', 'equipment', 'checklists', 'reports', 'training'],
    member: ['dashboard', 'calendar', 'team', 'my-rotas', 'training', 'performance', 'reports']
  };

  // Check if member is assigned as weekly lead (gives them checklist access)
  const [isWeeklyLead, setIsWeeklyLead] = useState(false);

  const hasAccess = (path) => {
    const userRole = user?.role || 'member';
    let access = roleAccess[userRole] || roleAccess.member;
    
    // If member is assigned as weekly lead, add checklists access
    if (userRole === 'member' && isWeeklyLead) {
      access = [...access, 'checklists'];
    }
    
    if (access.includes('all')) return true;
    const cleanPath = path.replace('/', '').replace('/','');
    return access.includes(cleanPath) || cleanPath === '' || cleanPath === 'login';
  };

  // Check weekly lead status for demo mode
  const checkWeeklyLeadStatus = () => {
    // In demo mode, simulate that Jasper Eromon is this week's lead
    if (demoMode && demoRole === 'member') {
      // Demo: member is weekly lead this week
      setIsWeeklyLead(true);
    }
  };

  useEffect(() => {
    // Check if demo mode was enabled
    if (demoMode) {
      const roleNames = {
        director: 'Dr. Adebowale Owoseni',
        team_lead: 'Adeola Hilton',
        assistant_lead: 'Oladimeji Tiamiyu',
        unit_head: 'Michel Adimula',
        member: 'Jasper Eromon'
      };
      setUser({ 
        user_id: `demo_${demoRole}`, 
        name: roleNames[demoRole] || 'Demo User', 
        email: 'demo@mediahq.com', 
        role: demoRole,
        teams: ['envoy_nation', 'e_nation'],
        primary_team: 'envoy_nation',
        skills: ['Camera', 'Sound', 'Lighting'],
        isWeeklyLead: demoRole === 'member' // Demo: member is weekly lead
      });
      // In demo, if role is member, they're the weekly lead
      setIsWeeklyLead(demoRole === 'member');
      setLoading(false);
    } else {
      checkAuth();
    }
  }, [demoRole]);

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
    localStorage.removeItem('demoMode');
    localStorage.removeItem('demoRole');
    setDemoMode(false);
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error');
    }
    setUser(null);
    window.location.href = '/login';
  };

  const enableDemoMode = (role = 'director') => {
    localStorage.setItem('demoMode', 'true');
    localStorage.setItem('demoRole', role);
    setDemoMode(true);
    setDemoRole(role);
    const roleNames = {
      director: 'Dr. Adebowale Owoseni',
      team_lead: 'Adeola Hilton',
      assistant_lead: 'Oladimeji Tiamiyu',
      unit_head: 'Michel Adimula',
      member: 'Jasper Eromon'
    };
    setUser({ 
      user_id: `demo_${role}`, 
      name: roleNames[role] || 'Demo User', 
      email: 'demo@mediahq.com', 
      role: role,
      teams: ['envoy_nation', 'e_nation'],
      primary_team: 'envoy_nation',
      skills: ['Camera', 'Sound', 'Lighting']
    });
    // Set demo notifications
    setNotifications([
      { notification_id: 'demo_n1', title: 'New Rota Assignment', message: 'You have been assigned to Sunday Morning Service', type: 'rota_assignment', read: false },
      { notification_id: 'demo_n2', title: 'Service Reminder', message: 'Worship Night starts in 24 hours', type: 'service_reminder', read: true },
      { notification_id: 'demo_n3', title: 'Training Update', message: 'New training material available: Camera Basics', type: 'training', read: true }
    ]);
    setUnreadCount(1);
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

  const fetchNotifications = async () => {
    if (demoMode || !user) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/notifications`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/notifications/unread-count`, { credentials: 'include' })
      ]);
      if (notifRes.ok) setNotifications(await notifRes.json());
      if (countRes.ok) {
        const data = await countRes.json();
        setUnreadCount(data.unread_count);
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
    try {
      await fetch(`${BACKEND_URL}/api/notifications/read-all`, { method: 'PUT', credentials: 'include' });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, demoMode, enableDemoMode, checkAuth, notifications, unreadCount, fetchNotifications, markAllRead, selectedTeam, switchTeam, hasAccess, switchDemoRole, isWeeklyLead }}>
      {children}
    </AuthContext.Provider>
  );
}

function Layout({ children }) {
  const location = useLocation();
  const { user, logout, demoMode, notifications, unreadCount, markAllRead, selectedTeam, switchTeam, hasAccess, switchDemoRole, isWeeklyLead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDirector = user?.role === 'director' || user?.role === 'admin';

  // Role labels for display
  const roleLabels = {
    director: 'Director',
    team_lead: 'Team Lead',
    assistant_lead: 'Assistant Lead',
    unit_head: 'Unit Head',
    member: 'Member'
  };

  // All possible nav items with access requirements
  const allNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', access: 'dashboard' },
    { name: 'Director View', path: '/director', icon: '👁️', access: 'director', directorOnly: true },
    { name: 'Calendar', path: '/calendar', icon: '📅', access: 'calendar' },
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
    { name: 'Settings', path: '/settings', icon: '⚙️', access: 'settings' }
  ];

  // Filter nav items based on role
  const navItems = allNavItems.filter(item => {
    if (item.directorOnly && !isDirector) return false;
    return hasAccess(item.access);
  });

  // Close sidebar when navigating on mobile
  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white p-2 -ml-2" data-testid="mobile-menu-btn">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-sm text-slate-900">TEN</div>
          <span className="font-bold text-white">MediaHQ</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 text-white" data-testid="mobile-notification-btn">
            <span className="text-xl">🔔</span>
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - Desktop always visible, Mobile slide-in */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo - Fixed */}
        <div className="flex-shrink-0 p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-lg text-slate-900">TEN</div>
            <div>
              <h1 className="font-bold text-lg text-white">MediaHQ</h1>
              <p className="text-xs text-slate-400">Church Media System</p>
            </div>
          </div>
        </div>

        {/* Team Selector & Notifications - Fixed */}
        <div className="flex-shrink-0 px-4 pt-4 space-y-2">
          {/* Team Selector */}
          <select
            value={selectedTeam}
            onChange={(e) => switchTeam(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
            data-testid="team-selector"
          >
            <option value="envoy_nation">🔵 Envoy Nation</option>
            <option value="e_nation">🟢 E-Nation</option>
          </select>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-all"
              data-testid="notification-bell"
            >
              <span className="text-sm text-slate-300">🔔 Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">{unreadCount}</span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-50 max-h-64 overflow-y-auto">
                <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
                  )}
                </div>
                {notifications && notifications.length > 0 ? (
                  notifications.slice(0, 5).map(n => (
                    <div key={n.notification_id} className={`p-3 border-b border-slate-700 last:border-0 ${!n.read ? 'bg-slate-700/50' : ''}`}>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-sm">No notifications</div>
                )}
              </div>
            )}
          </div>

          {/* Demo Mode Banner with Role Selector */}
          {demoMode && (
            <div className="relative">
              <button 
                onClick={() => setShowRoleSelector(!showRoleSelector)}
                className="w-full px-3 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg hover:bg-amber-500/30 transition-all"
              >
                <p className="text-xs text-amber-400 font-medium text-center">Demo: {roleLabels[user?.role] || 'Director'} ▼</p>
              </button>
              {showRoleSelector && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 rounded-lg border border-slate-700 shadow-xl z-50">
                  <p className="px-3 py-2 text-xs text-slate-400 border-b border-slate-700">Switch Demo Role:</p>
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <button
                      key={role}
                      onClick={() => { switchDemoRole(role); setShowRoleSelector(false); }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-all ${user?.role === role ? 'bg-slate-700 text-white' : 'text-slate-300'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (location.pathname === '/' && item.path === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
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

        {/* User Info & Logout - Fixed */}
        <div className="flex-shrink-0 p-4 border-t border-slate-800">
          {user && (
            <div className="mb-2">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          )}
          <button
            onClick={logout}
            data-testid="logout-btn"
            className="w-full px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all text-left"
          >
            Logout
          </button>
          <div className="mt-2 text-xs text-slate-600 text-center">
            © 2026 TEN MediaHQ
          </div>
        </div>
      </div>

      {/* Main Content - Add padding for mobile header */}
      <main className="flex-1 overflow-auto bg-slate-950 lg:ml-0 pt-16 lg:pt-0">{children}</main>
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
            <Route path="/director" element={<ProtectedRoute><DirectorDashboard /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
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