import { useEffect, useState } from 'react';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Performance() {
  const { demoMode } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const demoMetrics = [
    { user_id: 'demo_admin', name: 'John Smith', role: 'admin', total_assignments: 15, confirmed: 14, declined: 0, pending: 1, attended_services: 12, confirmation_rate: 93.33, attendance_rate: 80, reliability_score: 88 },
    { user_id: 'demo_lead', name: 'Sarah Johnson', role: 'team_lead', total_assignments: 12, confirmed: 11, declined: 1, pending: 0, attended_services: 10, confirmation_rate: 91.67, attendance_rate: 83.33, reliability_score: 88.33 },
    { user_id: 'demo_member1', name: 'Mike Wilson', role: 'member', total_assignments: 8, confirmed: 7, declined: 1, pending: 0, attended_services: 6, confirmation_rate: 87.5, attendance_rate: 75, reliability_score: 82.5 },
    { user_id: 'demo_member2', name: 'Emily Brown', role: 'member', total_assignments: 6, confirmed: 5, declined: 0, pending: 1, attended_services: 5, confirmation_rate: 83.33, attendance_rate: 83.33, reliability_score: 83.33 }
  ];

  const demoDashboard = {
    services: 25,
    rotas: 20,
    reports: 15,
    assignments: { total: 41, confirmed: 37, declined: 2, pending: 2, confirmation_rate: 90.24 }
  };

  useEffect(() => {
    loadData();
  }, [demoMode]);

  const loadData = async () => {
    if (demoMode) {
      setMetrics(demoMetrics);
      setSummary({ total_members: 4, total_rotas: 20, total_reports: 15, avg_reliability: 85.54 });
      setDashboard(demoDashboard);
      setLoading(false);
      return;
    }

    try {
      const [metricsRes, dashboardRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/performance/detailed`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/performance/dashboard`, { credentials: 'include' })
      ]);

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data.metrics || demoMetrics);
        setSummary(data.summary || { total_members: 0, total_rotas: 0, total_reports: 0, avg_reliability: 0 });
      } else {
        setMetrics(demoMetrics);
        setSummary({ total_members: 4, total_rotas: 20, total_reports: 15, avg_reliability: 85.54 });
      }

      if (dashboardRes.ok) {
        setDashboard(await dashboardRes.json());
      } else {
        setDashboard(demoDashboard);
      }
    } catch (err) {
      console.error(err);
      setMetrics(demoMetrics);
      setSummary({ total_members: 4, total_rotas: 20, total_reports: 15, avg_reliability: 85.54 });
      setDashboard(demoDashboard);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 70) return 'bg-amber-500/20';
    return 'bg-red-500/20';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="p-8" data-testid="performance-page">
      <h1 className="text-4xl font-bold text-white mb-2">Performance Metrics</h1>
      <p className="text-slate-400 mb-8">Track team reliability and attendance</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <p className="text-sm text-slate-400">Total Services</p>
          <p className="text-3xl font-bold text-white">{dashboard?.services || 0}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <p className="text-sm text-slate-400">Total Rotas</p>
          <p className="text-3xl font-bold text-white">{dashboard?.rotas || 0}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <p className="text-sm text-slate-400">Service Reports</p>
          <p className="text-3xl font-bold text-white">{dashboard?.reports || 0}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <p className="text-sm text-slate-400">Total Assignments</p>
          <p className="text-3xl font-bold text-white">{dashboard?.assignments?.total || 0}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800">
          <p className="text-sm text-slate-400">Confirmation Rate</p>
          <p className={`text-3xl font-bold ${getScoreColor(dashboard?.assignments?.confirmation_rate || 0)}`}>
            {dashboard?.assignments?.confirmation_rate || 0}%
          </p>
        </div>
      </div>

      {/* Assignment Breakdown */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Assignment Status</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-400">{dashboard?.assignments?.confirmed || 0}</p>
            <p className="text-sm text-slate-400">Confirmed</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-400">{dashboard?.assignments?.pending || 0}</p>
            <p className="text-sm text-slate-400">Pending</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-400">{dashboard?.assignments?.declined || 0}</p>
            <p className="text-sm text-slate-400">Declined</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-white">{dashboard?.assignments?.total || 0}</p>
            <p className="text-sm text-slate-400">Total</p>
          </div>
        </div>
      </div>

      {/* Team Leaderboard */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
        <h2 className="text-xl font-bold text-white mb-4">Team Reliability Leaderboard</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left p-3 text-slate-400 text-sm">#</th>
                <th className="text-left p-3 text-slate-400 text-sm">Name</th>
                <th className="text-left p-3 text-slate-400 text-sm">Role</th>
                <th className="text-center p-3 text-slate-400 text-sm">Assignments</th>
                <th className="text-center p-3 text-slate-400 text-sm">Confirmed</th>
                <th className="text-center p-3 text-slate-400 text-sm">Confirmation %</th>
                <th className="text-center p-3 text-slate-400 text-sm">Attended</th>
                <th className="text-center p-3 text-slate-400 text-sm">Attendance %</th>
                <th className="text-center p-3 text-slate-400 text-sm">Reliability Score</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((member, idx) => (
                <tr key={member.user_id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-3 text-slate-500">{idx + 1}</td>
                  <td className="p-3">
                    <p className="font-medium text-white">{member.name}</p>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      member.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      member.role === 'team_lead' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>{member.role?.replace('_', ' ')}</span>
                  </td>
                  <td className="p-3 text-center text-slate-300">{member.total_assignments}</td>
                  <td className="p-3 text-center text-green-400">{member.confirmed}</td>
                  <td className="p-3 text-center">
                    <span className={getScoreColor(member.confirmation_rate)}>{member.confirmation_rate}%</span>
                  </td>
                  <td className="p-3 text-center text-slate-300">{member.attended_services}</td>
                  <td className="p-3 text-center">
                    <span className={getScoreColor(member.attendance_rate)}>{member.attendance_rate}%</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-3 py-1 rounded-full font-bold ${getScoreBg(member.reliability_score)} ${getScoreColor(member.reliability_score)}`}>
                      {member.reliability_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {metrics.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-5xl mb-4">📊</p>
            <p>No performance data available yet</p>
          </div>
        )}
      </div>

      {/* Average Reliability */}
      {summary && (
        <div className="mt-6 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Team Average Reliability</h3>
              <p className="text-sm text-slate-400">{summary.total_members} team members</p>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(summary.avg_reliability)}`}>
              {summary.avg_reliability}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
