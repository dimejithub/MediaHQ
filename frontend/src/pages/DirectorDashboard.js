import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function DirectorDashboard() {
  const { profile, demoMode } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [, setAttendanceData] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [demoMode]);

  const fetchData = async () => {
    if (demoMode) {
      setStats({
        total_members: 23,
        envoy_nation: 20,
        e_nation: 3,
        active_services: 5,
        attendance_rate: 72
      });
      setMembers([
        { name: 'Adeola Hilton', role: 'team_lead', attendance: 95 },
        { name: 'Oladimeji Tiamiyu', role: 'assistant_lead', attendance: 88 },
        { name: 'Michel Adimula', role: 'unit_head', attendance: 75 },
        { name: 'Gabriel Mensah', role: 'member', attendance: 60 },
        { name: 'Jasper Okonkwo', role: 'member', attendance: 45 },
      ]);
      setLoading(false);
      return;
    }

    try {
      const [profilesRes, servicesRes, attendanceRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('services').select('*').gte('date', new Date().toISOString().split('T')[0]),
        supabase.from('attendance').select('*').order('date', { ascending: false }).limit(10)
      ]);

      const profiles = profilesRes.data || [];
      
      setStats({
        total_members: profiles.length,
        envoy_nation: profiles.filter(p => p.primary_team === 'envoy_nation').length,
        e_nation: profiles.filter(p => p.primary_team === 'e_nation').length,
        active_services: servicesRes.data?.length || 0,
        attendance_rate: 75
      });

      setMembers(profiles.slice(0, 10));
      setAttendanceData(attendanceRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'director' && !demoMode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-white text-xl">Director Access Only</p>
          <p className="text-slate-400 mt-2">You don't have permission to view this page</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading director dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Director Dashboard</h1>
        <p className="text-slate-400 mt-1">Team overview and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-5 border border-purple-500/30">
          <p className="text-purple-400 text-sm">Total Members</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.total_members}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-5 border border-blue-500/30">
          <p className="text-blue-400 text-sm">Envoy Nation</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.envoy_nation}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-2xl p-5 border border-cyan-500/30">
          <p className="text-cyan-400 text-sm">E-Nation</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.e_nation}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-5 border border-green-500/30">
          <p className="text-green-400 text-sm">Active Services</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.active_services}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl p-5 border border-orange-500/30">
          <p className="text-orange-400 text-sm">Attendance Rate</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.attendance_rate}%</p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Team Performance</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {members.slice(0, 5).map((member, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm">
                    {member.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{member.name}</p>
                    <p className="text-slate-400 text-xs capitalize">{member.role?.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        member.attendance >= 75 ? 'bg-green-500' :
                        member.attendance >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${member.attendance || 0}%` }}
                    />
                  </div>
                  <span className="text-slate-400 text-sm w-10">{member.attendance || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-slate-800/50 rounded-xl text-left hover:bg-slate-800 transition-all">
              <span className="text-2xl">📊</span>
              <p className="text-white font-medium mt-2">Generate Report</p>
              <p className="text-slate-400 text-xs">Export team analytics</p>
            </button>
            <button className="p-4 bg-slate-800/50 rounded-xl text-left hover:bg-slate-800 transition-all">
              <span className="text-2xl">📧</span>
              <p className="text-white font-medium mt-2">Send Reminder</p>
              <p className="text-slate-400 text-xs">Notify team members</p>
            </button>
            <button className="p-4 bg-slate-800/50 rounded-xl text-left hover:bg-slate-800 transition-all">
              <span className="text-2xl">📋</span>
              <p className="text-white font-medium mt-2">Manage Rotas</p>
              <p className="text-slate-400 text-xs">Assign duties</p>
            </button>
            <button className="p-4 bg-slate-800/50 rounded-xl text-left hover:bg-slate-800 transition-all">
              <span className="text-2xl">⚙️</span>
              <p className="text-white font-medium mt-2">Team Settings</p>
              <p className="text-slate-400 text-xs">Configure teams</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
