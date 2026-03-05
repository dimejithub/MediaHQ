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
  const [loading, setLoading] = useState(true);

  const teamId = profile?.primary_team || 'envoy_nation';

  useEffect(() => {
    const fetchData = async () => {
      if (demoMode) {
        // Demo data
        setStats({
          total_members: 23,
          total_services: 5,
          total_equipment: 6,
          available_equipment: 4,
          pending_rotas: 2
        });
        setUpcomingServices([
          { id: 1, title: 'Sunday Morning Service', date: '2026-03-08', time: '11:00', type: 'sunday_service' },
          { id: 2, title: 'Midweek Leicester Blessings', date: '2026-03-11', time: '18:30', type: 'midweek' },
          { id: 3, title: 'Tuesday Standup Meeting', date: '2026-03-10', time: '20:00', type: 'standup' },
        ]);
        setLoading(false);
        return;
      }

      try {
        // Fetch stats
        const [membersRes, servicesRes, equipmentRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('services').select('*').eq('team_id', teamId).gte('date', new Date().toISOString().split('T')[0]).order('date').limit(5),
          supabase.from('equipment').select('id, status').eq('team_id', teamId)
        ]);

        const availableEquipment = equipmentRes.data?.filter(e => e.status === 'available').length || 0;

        setStats({
          total_members: membersRes.count || 0,
          total_services: servicesRes.data?.length || 0,
          total_equipment: equipmentRes.data?.length || 0,
          available_equipment: availableEquipment,
          pending_rotas: 2
        });

        setUpcomingServices(servicesRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
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
                    {service.type === 'sunday_service' ? '⛪' : service.type === 'standup' ? '🎤' : '🙏'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{service.title}</p>
                    <p className="text-slate-400 text-sm">{formatDate(service.date)} • {service.time}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    service.type === 'sunday_service' ? 'bg-blue-500/20 text-blue-400' :
                    service.type === 'standup' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {service.type.replace('_', ' ')}
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
    </div>
  );
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
