import { useEffect, useState } from 'react';
import { useAuth } from '@/App';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function TeamCard({ summary }) {
  const teamName = summary.team === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';
  const teamColor = summary.team === 'envoy_nation' ? 'blue' : 'green';
  
  return (
    <div className={`bg-slate-900 rounded-xl p-6 border border-${teamColor}-500/30`}>
      <h3 className={`text-xl font-bold text-${teamColor}-400 mb-4`}>{teamName}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-slate-400">Members</p>
          <p className="text-2xl font-bold text-white">{summary.total_members}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Services</p>
          <p className="text-2xl font-bold text-white">{summary.total_services}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Rotas</p>
          <p className="text-2xl font-bold text-white">{summary.total_rotas}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Reports</p>
          <p className="text-2xl font-bold text-white">{summary.total_reports}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-sm text-slate-400">Upcoming Services</p>
        <p className="text-lg font-bold text-amber-400">{summary.upcoming_services}</p>
      </div>
    </div>
  );
}

export default function DirectorDashboard() {
  const { demoMode, user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const demoData = {
    team_summaries: [
      { team: 'envoy_nation', team_name: 'Envoy Nation', total_members: 8, total_services: 15, total_rotas: 12, total_reports: 10, upcoming_services: 3 },
      { team: 'e_nation', team_name: 'E-Nation', total_members: 6, total_services: 12, total_rotas: 10, total_reports: 8, upcoming_services: 2 }
    ],
    combined_events: 4,
    recent_reports: [
      { report_id: 'demo_r1', service_id: 'demo_s1', attendees: ['u1', 'u2', 'u3'], created_at: '2026-02-08T10:00:00Z' },
      { report_id: 'demo_r2', service_id: 'demo_s2', attendees: ['u1', 'u2'], created_at: '2026-02-05T10:00:00Z' }
    ],
    recent_handovers: [
      { handover_id: 'demo_h1', equipment_id: 'eq1', from_team: 'envoy_nation', to_team: 'e_nation', condition_before: 'good', handover_date: '2026-02-07' }
    ],
    total_equipment: 25
  };

  useEffect(() => {
    loadData();
  }, [demoMode]);

  const loadData = async () => {
    if (demoMode) {
      setData(demoData);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/director/dashboard`, { credentials: 'include' });
      if (res.ok) {
        setData(await res.json());
      } else {
        setData(demoData);
      }
    } catch (err) {
      console.error(err);
      setData(demoData);
    } finally {
      setLoading(false);
    }
  };

  const isDirector = user?.role === 'director' || user?.role === 'admin';

  if (!isDirector) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-400">Director dashboard is only available to directors and administrators.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="p-8" data-testid="director-dashboard">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Director Dashboard</h1>
        <p className="text-slate-400">Overview of all teams and activities</p>
      </div>

      {/* Team Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {data?.team_summaries?.map(summary => (
          <TeamCard key={summary.team} summary={summary} />
        ))}
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-2xl">🤝</div>
            <div>
              <p className="text-sm text-slate-400">Combined Events</p>
              <p className="text-2xl font-bold text-white">{data?.combined_events || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-2xl">🎥</div>
            <div>
              <p className="text-sm text-slate-400">Total Equipment</p>
              <p className="text-2xl font-bold text-white">{data?.total_equipment || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-2xl">📊</div>
            <div>
              <p className="text-sm text-slate-400">Total Members</p>
              <p className="text-2xl font-bold text-white">
                {(data?.team_summaries?.reduce((acc, t) => acc + t.total_members, 0)) || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">📄 Recent Service Reports</h2>
          {data?.recent_reports && data.recent_reports.length > 0 ? (
            <div className="space-y-3">
              {data.recent_reports.slice(0, 5).map(report => (
                <div key={report.report_id} className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <p className="text-sm text-white">Service Report</p>
                  <p className="text-xs text-slate-400">{report.attendees?.length || 0} attendees</p>
                  <p className="text-xs text-slate-500">{new Date(report.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">No recent reports</p>
          )}
          <Link to="/reports" className="block mt-4 text-center text-sm text-blue-400 hover:text-blue-300">View All Reports →</Link>
        </div>

        {/* Recent Handovers */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">🔄 Recent Equipment Handovers</h2>
          {data?.recent_handovers && data.recent_handovers.length > 0 ? (
            <div className="space-y-3">
              {data.recent_handovers.slice(0, 5).map(handover => (
                <div key={handover.handover_id} className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">{handover.from_team} → {handover.to_team}</p>
                      <p className="text-xs text-slate-400">Condition: {handover.condition_before}</p>
                    </div>
                    <span className="text-xs text-slate-500">{handover.handover_date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm text-center py-4">No recent handovers</p>
          )}
          <Link to="/equipment" className="block mt-4 text-center text-sm text-blue-400 hover:text-blue-300">View Equipment →</Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-lg font-bold text-white mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/calendar" className="px-4 py-3 bg-slate-800 text-white rounded-lg text-center hover:bg-slate-700 transition-all border border-slate-700">
            📅 View Calendar
          </Link>
          <Link to="/performance" className="px-4 py-3 bg-slate-800 text-white rounded-lg text-center hover:bg-slate-700 transition-all border border-slate-700">
            📈 Performance
          </Link>
          <Link to="/team" className="px-4 py-3 bg-slate-800 text-white rounded-lg text-center hover:bg-slate-700 transition-all border border-slate-700">
            👥 All Members
          </Link>
          <Link to="/lead-rotation" className="px-4 py-3 bg-slate-800 text-white rounded-lg text-center hover:bg-slate-700 transition-all border border-slate-700">
            🔄 Lead Rotation
          </Link>
        </div>
      </div>
    </div>
  );
}
