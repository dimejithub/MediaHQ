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
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Dashboard</h1>
        <p className="text-slate-600 text-lg">Welcome to TEN MediaHQ - Your media operations command center</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-slate-100 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl shadow-md">👥</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Team Members</p>
              <p className="text-3xl font-bold text-slate-800">{kpis?.total_members || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-slate-100 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-md">🗓️</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Services</p>
              <p className="text-3xl font-bold text-slate-800">{kpis?.total_services || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-slate-100 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-2xl shadow-md">🎥</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Equipment</p>
              <p className="text-3xl font-bold text-slate-800">{kpis?.available_equipment || 0}<span className="text-lg text-slate-400">/{kpis?.total_equipment || 0}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-slate-100 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-2xl shadow-md">⏳</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Rotas</p>
              <p className="text-3xl font-bold text-slate-800">{kpis?.pending_rotas || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">📅</span>
            Upcoming Services
          </h2>
          <div className="space-y-4">
            {kpis?.upcoming_services && kpis.upcoming_services.length > 0 ? (
              kpis.upcoming_services.slice(0, 5).map((service, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-slate-800">{service.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{service.description || 'No description'}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium">📅 {service.date}</span>
                    <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium">🕐 {service.time}</span>
                    <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-sm font-medium capitalize">{service.type.replace('_', ' ')}</span>
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
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="text-3xl">⚡</span>
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link to="/services" className="block w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all hover:scale-105 text-center">
              📅 Schedule Service
            </Link>
            <Link to="/team" className="block w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all text-center">
              👥 View Team
            </Link>
            <Link to="/equipment" className="block w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all text-center">
              🎥 Manage Equipment
            </Link>
            <Link to="/my-rotas" className="block w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-all text-center">
              ✅ My Rotas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}