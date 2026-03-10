import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const { profile, demoMode } = useAuth();
  const [stats, setStats] = useState({
    total_members: 0,
    total_services: 0,
    total_equipment: 0,
    available_equipment: 0,
    pending_rotas: 0
  });
  const [upcomingServices, setUpcomingServices] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const teamId = profile?.primary_team || 'envoy_nation';

  useEffect(() => {
    const fetchData = async () => {
      if (demoMode) {
        setStats({ total_members: 23, total_services: 5, total_equipment: 0, available_equipment: 0, pending_rotas: 2 });
        setUpcomingServices([
          { id: 1, title: 'Leicester Blessing', date: '2026-03-05', time: '18:30', type: 'midweek' },
          { id: 2, title: 'Sunday Service', date: '2026-03-08', time: '11:00', type: 'sunday_service' },
          { id: 3, title: 'Connected with PMO', date: '2026-03-26', time: '18:30', type: 'special' },
        ]);
        setRecentActivity([
          { id: 1, action: 'rota_created', details: 'Rota for Sunday Service - Lead: Adeola Hilton, 9 members', created_at: new Date(Date.now() - 3600000).toISOString() },
          { id: 2, action: 'checklist_completed', details: 'Sunday Service checklist completed', created_at: new Date(Date.now() - 7200000).toISOString() },
          { id: 3, action: 'attendance_marked', details: 'Tuesday standup - 5 of 7 present', created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 4, action: 'member_joined', details: 'New member joined: Temidayo Peters', created_at: new Date(Date.now() - 172800000).toISOString() },
        ]);
        setLoading(false);
        return;
      }

      try {
        const [membersRes, servicesRes, equipmentRes, activityRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('services').select('*').eq('team_id', teamId).gte('date', new Date().toISOString().split('T')[0]).order('date').limit(5),
          supabase.from('equipment').select('id, status').eq('team_id', teamId),
          supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        const availableEquipment = equipmentRes.data?.filter(e => e.status === 'available').length || 0;
        setStats({
          total_members: membersRes.count || 1,
          total_services: servicesRes.data?.length || 0,
          total_equipment: equipmentRes.data?.length || 0,
          available_equipment: availableEquipment,
          pending_rotas: 0
        });
        setUpcomingServices(servicesRes.data || []);
        setRecentActivity(activityRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setStats({ total_members: 1, total_services: 0, total_equipment: 0, available_equipment: 0, pending_rotas: 0 });
        setUpcomingServices([]);
        setRecentActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, demoMode]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">
          {getGreeting()}, {profile?.name?.split(' ')[0] || 'User'}
        </h1>
        <p className="text-slate-400 mt-1 capitalize">
          {profile?.role?.replace('_', ' ') || 'Team Member'} • {teamId.replace('_', ' ')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Team Members" 
          value={stats.total_members} 
          icon="👥"
          color="blue"
        />
        <StatCard 
          label="Upcoming Services" 
          value={stats.total_services} 
          icon="📅"
          color="purple"
        />
        <StatCard 
          label="Equipment" 
          value={`${stats.available_equipment}/${stats.total_equipment}`} 
          subtext="Available"
          icon="📦"
          color="green"
        />
        <StatCard 
          label="Pending Rotas" 
          value={stats.pending_rotas} 
          icon="📋"
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Services */}
        <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Upcoming Services</h2>
            <Link to="/services" className="text-blue-400 text-sm hover:text-blue-300">
              View all →
            </Link>
          </div>
          
          {upcomingServices.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No upcoming services</p>
          ) : (
            <div className="space-y-3">
              {upcomingServices.map((service, idx) => (
                <div 
                  key={service.id || idx}
                  className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    {service.type === 'sunday_service' ? '⛪' : service.type === 'special' ? '🌟' : '🙏'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{service.title}</p>
                    <p className="text-slate-400 text-sm">{formatDate(service.date)} • {service.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.type === 'sunday_service' ? 'bg-blue-500/20 text-blue-400' :
                    service.type === 'special' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {service.type === 'sunday_service' ? 'Sunday' : service.type === 'special' ? 'Special' : 'Midweek'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-lg font-semibold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <QuickAction to="/attendance" icon="✓" label="Mark Attendance" />
            <QuickAction to="/equipment" icon="📦" label="Check Equipment" />
            <QuickAction to="/rotas" icon="📋" label="View Rotas" />
            <QuickAction to="/calendar" icon="📅" label="Calendar" />
            <QuickAction to="/team" icon="👥" label="Team Directory" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800" data-testid="activity-log">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-slate-800">
            {recentActivity.map((item) => (
              <div key={item.id} className="px-5 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 ${getActivityStyle(item.action).bg}`}>
                  {getActivityStyle(item.action).icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{item.details}</p>
                  <p className="text-xs text-slate-500">{timeAgo(item.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getActivityStyle(action) {
  const styles = {
    rota_created: { icon: '📋', bg: 'bg-blue-500/20' },
    checklist_completed: { icon: '✅', bg: 'bg-green-500/20' },
    attendance_marked: { icon: '✓', bg: 'bg-purple-500/20' },
    member_joined: { icon: '👤', bg: 'bg-cyan-500/20' },
    equipment_checkout: { icon: '📦', bg: 'bg-orange-500/20' },
  };
  return styles[action] || { icon: '📝', bg: 'bg-slate-500/20' };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function StatCard({ label, value, subtext, icon, color }) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-5 border`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl lg:text-3xl font-bold text-white">{value}</div>
      <div className="text-slate-400 text-sm mt-1">{subtext || label}</div>
    </div>
  );
}

function QuickAction({ to, icon, label }) {
  return (
    <Link 
      to={to}
      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-all group"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-slate-300 group-hover:text-white transition-colors">{label}</span>
      <span className="ml-auto text-slate-500 group-hover:text-slate-300 transition-colors">→</span>
    </Link>
  );
}
