import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DEMO_DATA = {
  envoy_nation: {
    total_members: 23,
    total_services: 5,
    total_equipment: 6,
    available_equipment: 4,
    pending_rotas: 2,
    weekly_lead: 'Oladimeji Tiamiyu',
    upcoming_services: [
      { service_id: 'demo_en_1', title: 'Sunday Service', date: '2026-02-08', time: '11:00', type: 'sunday_service', description: 'Envoy Nation Sunday worship service' },
      { service_id: 'demo_en_2', title: 'Midweek (Leicester Blessings)', date: '2026-02-12', time: '19:00', type: 'midweek_service', description: 'Thursday midweek service' },
      { service_id: 'demo_en_3', title: 'Tuesday Standup', date: '2026-02-10', time: '19:00', type: 'tuesday_standup', description: 'Weekly team meeting' }
    ]
  },
  e_nation: {
    total_members: 3,
    total_services: 4,
    total_equipment: 3,
    available_equipment: 3,
    pending_rotas: 1,
    weekly_lead: 'David Lee',
    upcoming_services: [
      { service_id: 'demo_e_1', title: 'The Commissioned Envoy', date: '2026-02-08', time: '14:00', type: 'sunday_service', description: 'E-Nation Sunday service' },
      { service_id: 'demo_e_2', title: 'Midweek Service', date: '2026-02-11', time: '19:00', type: 'midweek_service', description: 'Wednesday gathering' }
    ]
  }
};

export default function Dashboard() {
  const { demoMode, selectedTeam, user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (demoMode) {
      // Demo data filtered by selected team
      setKpis(DEMO_DATA[selectedTeam] || DEMO_DATA.envoy_nation);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/dashboard/kpis?team=${selectedTeam}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setKpis(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setKpis(DEMO_DATA[selectedTeam] || DEMO_DATA.envoy_nation);
        setLoading(false);
      });
  }, [demoMode, selectedTeam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="text-xl text-slate-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const teamDisplayName = selectedTeam === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';
  
  // Get first name for personalized greeting
  const firstName = user?.name ? user.name.split(' ')[0] : 'Team Member';
  
  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 particles-bg" data-testid="dashboard">
      {/* Header */}
      <div className="mb-4 sm:mb-8 animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">
          <span className="gradient-text-shine">{getGreeting()}, {firstName}</span> 👋
        </h1>
        <p className="text-sm sm:text-base text-slate-400">Here's your {teamDisplayName} overview for today</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-800 stat-card hover-glow animate-fadeInUp stagger-1" data-testid="kpi-members">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-xl sm:text-2xl animate-float">👥</div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Members</p>
              <p className="text-xl sm:text-2xl font-bold text-white stat-value animate-countUp">{kpis?.total_members || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-800 stat-card hover-glow animate-fadeInUp stagger-2" data-testid="kpi-services">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-xl sm:text-2xl animate-float" style={{animationDelay: '0.5s'}}>🗓️</div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Services</p>
              <p className="text-xl sm:text-2xl font-bold text-white stat-value animate-countUp" style={{animationDelay: '0.1s'}}>{kpis?.total_services || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-800 stat-card hover-glow animate-fadeInUp stagger-3" data-testid="kpi-equipment">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center text-xl sm:text-2xl animate-float" style={{animationDelay: '1s'}}>🎥</div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Equipment</p>
              <p className="text-xl sm:text-2xl font-bold text-white stat-value animate-countUp" style={{animationDelay: '0.2s'}}>{kpis?.available_equipment || 0}<span className="text-xs sm:text-sm text-slate-500">/{kpis?.total_equipment || 0}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-800 stat-card hover-glow animate-fadeInUp stagger-4" data-testid="kpi-rotas">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center text-xl sm:text-2xl animate-pulse">⏳</div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-white stat-value animate-countUp" style={{animationDelay: '0.3s'}}>{kpis?.pending_rotas || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Lead Highlight */}
      {kpis?.weekly_lead && (
        <div className="animate-fadeInUp stagger-5">
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-blue-500/30 hover-border-glow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg animate-pulse">
                {kpis.weekly_lead.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-blue-400 uppercase tracking-wider font-medium">This Week's Lead</p>
                <p className="text-lg font-bold text-white">{kpis.weekly_lead}</p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                  Week {Math.ceil((new Date().getDate()) / 7)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Services & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Upcoming Services */}
        <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-800 animate-fadeInLeft glass hover-shine">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <span className="text-xl sm:text-2xl">📅</span>
            Upcoming Services
          </h2>
          <div className="space-y-3">
            {kpis?.upcoming_services && kpis.upcoming_services.length > 0 ? (
              kpis.upcoming_services.slice(0, 5).map((service, idx) => (
                <div key={idx} className={`p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-slate-700 card-animate hover-lift animate-fadeInUp`} style={{animationDelay: `${idx * 0.1}s`}}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-sm sm:text-base">{service.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">{service.description || 'No description'}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      service.type === 'sunday_service' ? 'bg-blue-500/20 text-blue-400' :
                      service.type === 'midweek_service' ? 'bg-purple-500/20 text-purple-400' :
                      service.type === 'tuesday_standup' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {service.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                    <span className="px-2 py-1 rounded text-xs bg-slate-700/50 text-slate-300 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {service.date}
                    </span>
                    <span className="px-2 py-1 rounded text-xs bg-slate-700/50 text-slate-300 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {service.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12 text-slate-500">
                <p className="text-3xl sm:text-4xl mb-2">📭</p>
                <p className="text-sm sm:text-base">No upcoming services</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-slate-800 animate-fadeInRight glass">
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
            <span className="text-xl sm:text-2xl animate-wiggle">⚡</span>
            Quick Actions
          </h2>
          <div className="space-y-2 sm:space-y-3">
            <Link to="/services" data-testid="quick-action-schedule" className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all text-center text-sm sm:text-base btn-animate hover-lift">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Schedule Service
              </span>
            </Link>
            <Link to="/assign-rotas" data-testid="quick-action-rotas" className="block w-full px-4 py-3 bg-slate-800/80 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-center border border-slate-700 hover:border-slate-600 text-sm sm:text-base btn-animate">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Assign Rotas
              </span>
            </Link>
            <Link to="/attendance" data-testid="quick-action-attendance" className="block w-full px-4 py-3 bg-slate-800/80 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-center border border-slate-700 hover:border-slate-600 text-sm sm:text-base btn-animate">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                Mark Attendance
              </span>
            </Link>
            <Link to="/equipment" data-testid="quick-action-equipment" className="block w-full px-4 py-3 bg-slate-800/80 text-white rounded-lg font-medium hover:bg-slate-700 transition-all text-center border border-slate-700 hover:border-slate-600 text-sm sm:text-base btn-animate">
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                Manage Equipment
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}