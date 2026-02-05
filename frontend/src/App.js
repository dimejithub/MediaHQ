import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col transition-all duration-300 shadow-2xl`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-black flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white/20">TEN</div>
            {sidebarOpen && <span className="font-bold text-xl text-white">MediaHQ</span>}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-black shadow-lg transform scale-105'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-2xl">{item.icon}</span>
                {sidebarOpen && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-4 text-slate-400 hover:bg-white/10 hover:text-white border-t border-white/10 transition-colors"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
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