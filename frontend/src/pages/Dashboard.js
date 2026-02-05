import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/dashboard/kpis`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setKpis(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-600 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400 text-lg">Welcome to TEN MediaHQ - Your media operations command center</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-black flex items-center justify-center text-white text-2xl shadow-md ring-2 ring-white/20">👥</div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Team Members</p>
              <p className="text-3xl font-bold text-white">{kpis?.total_members || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-black flex items-center justify-center text-white text-2xl shadow-md ring-2 ring-white/20">🗓️</div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Services</p>
              <p className="text-3xl font-bold text-white">{kpis?.total_services || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-black flex items-center justify-center text-white text-2xl shadow-md ring-2 ring-white/20">🎥</div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Equipment</p>
              <p className="text-3xl font-bold text-white">{kpis?.available_equipment || 0}<span className="text-lg text-slate-500">/{kpis?.total_equipment || 0}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-white/10 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-700 to-black flex items-center justify-center text-white text-2xl shadow-md ring-2 ring-white/20">⏳</div>
            <div>
              <p className="text-sm text-slate-400 font-medium">Pending Rotas</p>
              <p className="text-3xl font-bold text-white">{kpis?.pending_rotas || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">📅</span>
            Upcoming Services
          </h2>
          <div className="space-y-4">
            {kpis?.upcoming_services && kpis.upcoming_services.length > 0 ? (
              kpis.upcoming_services.slice(0, 5).map((service, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                  <h3 className="font-bold text-lg text-white">{service.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{service.description || 'No description'}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm font-medium">📅 {service.date}</span>
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm font-medium">🕐 {service.time}</span>
                    <span className="px-3 py-1 rounded-lg bg-white/10 text-white text-sm font-medium capitalize">{service.type.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <p className="text-6xl mb-4">📭</p>
                <p>No upcoming services</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/services" className="block w-full px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-slate-200 transition-all hover:scale-105 text-center">
              📅 Schedule Service
            </Link>
            <Link to="/team" className="block w-full px-4 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-center">
              👥 View Team
            </Link>
            <Link to="/equipment" className="block w-full px-4 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-center">
              🎥 Manage Equipment
            </Link>
            <Link to="/my-rotas" className="block w-full px-4 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all text-center">
              ✅ My Rotas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}