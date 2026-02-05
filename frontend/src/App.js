import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
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
import '@/App.css';

function Layout({ children }) {
  const location = useLocation();

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
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-bold text-xl text-slate-900">TEN</div>
            <div>
              <h1 className="font-bold text-xl text-white">MediaHQ</h1>
              <p className="text-xs text-slate-400">Church Media System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 text-center">
            © 2026 TEN MediaHQ
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-slate-950">{children}</main>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/team" element={<TeamDirectory />} />
            <Route path="/services" element={<Services />} />
            <Route path="/assign-rotas" element={<AssignRotas />} />
            <Route path="/my-rotas" element={<MyRotas />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/reports" element={<ServiceReports />} />
            <Route path="/training" element={<Training />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;