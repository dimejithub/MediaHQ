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
        <div className="text-xl text-slate-400 animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Overview of your media operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-2xl">👥</div>
            <div>
              <p className="text-sm text-slate-400">Team Members</p>
              <p className="text-2xl font-bold text-white">{kpis?.total_members || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-2xl">🗓️</div>
            <div>
              <p className="text-sm text-slate-400">Services</p>
              <p className="text-2xl font-bold text-white">{kpis?.total_services || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-2xl">🎥</div>
            <div>
              <p className="text-sm text-slate-400">Equipment</p>
              <p className="text-2xl font-bold text-white">{kpis?.available_equipment || 0}<span className="text-sm text-slate-500">/{kpis?.total_equipment || 0}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-2xl">⏳</div>
            <div>
              <p className="text-sm text-slate-400">Pending Rotas</p>
              <p className="text-2xl font-bold text-white">{kpis?.pending_rotas || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Services & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Services */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Upcoming Services
          </h2>
          <div className="space-y-3">
            {kpis?.upcoming_services && kpis.upcoming_services.length > 0 ? (
              kpis.upcoming_services.slice(0, 5).map((service, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all">
                  <h3 className="font-semibold text-white">{service.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{service.description || 'No description'}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">{service.date}</span>
                    <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">{service.time}</span>
                    <span className="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300 capitalize">{service.type.replace('_', ' ')}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p className="text-4xl mb-2">📭</p>
                <p>No upcoming services</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/services" className="block w-full px-4 py-3 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all text-center">
              Schedule Service
            </Link>
            <Link to="/assign-rotas" className="block w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-center border border-slate-700">
              Assign Rotas
            </Link>
            <Link to="/equipment" className="block w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-center border border-slate-700">
              Manage Equipment
            </Link>
            <Link to="/checklists" className="block w-full px-4 py-3 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-center border border-slate-700">
              View Checklists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}