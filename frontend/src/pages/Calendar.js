import { useEffect, useState } from 'react';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function EventBadge({ type }) {
  const colors = {
    service: 'bg-blue-500/20 text-blue-400',
    report: 'bg-green-500/20 text-green-400',
    checklist: 'bg-amber-500/20 text-amber-400',
    handover: 'bg-purple-500/20 text-purple-400'
  };
  return <span className={`px-2 py-0.5 text-xs rounded ${colors[type] || 'bg-slate-700 text-slate-300'}`}>{type}</span>;
}

function TeamBadge({ team, isCombined }) {
  if (isCombined) return <span className="px-2 py-0.5 text-xs rounded bg-pink-500/20 text-pink-400">Combined</span>;
  if (team === 'envoy_nation') return <span className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">Envoy Nation</span>;
  if (team === 'e_nation') return <span className="px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-400">E-Nation</span>;
  return null;
}

export default function Calendar() {
  const { demoMode } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [counts, setCounts] = useState({ services: 0, reports: 0, checklists: 0, handovers: 0 });

  const demoEvents = [
    { id: 'demo_s1', type: 'service', title: 'Sunday Morning Service', date: '2026-02-08', time: '11:00', team: 'envoy_nation', service_type: 'sunday_service' },
    { id: 'demo_s2', type: 'service', title: 'E-Nation Sunday Service', date: '2026-02-08', time: '09:00', team: 'e_nation', service_type: 'sunday_service' },
    { id: 'demo_s3', type: 'service', title: 'Midweek Service', date: '2026-02-12', time: '18:00', team: 'envoy_nation', service_type: 'midweek_service' },
    { id: 'demo_s4', type: 'service', title: 'E-Nation Midweek', date: '2026-02-11', time: '18:00', team: 'e_nation', service_type: 'midweek_service' },
    { id: 'demo_r1', type: 'report', title: 'Report: Sunday Morning Service', date: '2026-02-08', attendees_count: 8 },
    { id: 'demo_c1', type: 'checklist', title: 'Service Checklist', date: '2026-02-08', progress: '25/29' },
    { id: 'demo_h1', type: 'handover', title: 'Equipment Handover', date: '2026-02-10', from_team: 'envoy_nation', to_team: 'e_nation', condition: 'good' },
    { id: 'demo_e1', type: 'service', title: 'Annual Conference', date: '2026-02-22', time: '09:00', is_combined: true, service_type: 'conference' }
  ];

  useEffect(() => {
    loadData();
  }, [year, month, selectedTeam, demoMode]);

  const loadData = async () => {
    if (demoMode) {
      const filtered = selectedTeam === 'all' ? demoEvents : demoEvents.filter(e => e.team === selectedTeam || e.is_combined);
      setEvents(filtered);
      setCounts({ services: 4, reports: 1, checklists: 1, handovers: 1 });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const teamParam = selectedTeam !== 'all' ? `&team=${selectedTeam}` : '';
      const res = await fetch(`${BACKEND_URL}/api/calendar/month/${year}/${month}?${teamParam}`, { credentials: 'include' });
      
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setCounts({
          services: data.services_count || 0,
          reports: data.reports_count || 0,
          checklists: data.checklists_count || 0,
          handovers: data.handovers_count || 0
        });
      } else {
        setEvents(demoEvents);
      }
    } catch (err) {
      console.error(err);
      setEvents(demoEvents);
    } finally {
      setLoading(false);
    }
  };

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {});

  const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(b) - new Date(a));

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading calendar...</div></div>;
  }

  return (
    <div className="p-8" data-testid="calendar-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Calendar</h1>
          <p className="text-slate-400">View services, reports, checklists, and handovers</p>
        </div>
        <div className="flex items-center gap-4">
          <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
            <option value="all">All Teams</option>
            <option value="envoy_nation">Envoy Nation</option>
            <option value="e_nation">E-Nation</option>
          </select>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 bg-slate-900 rounded-xl p-4 border border-slate-800">
        <button onClick={prevMonth} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">← Previous</button>
        <h2 className="text-2xl font-bold text-white">{MONTHS[month - 1]} {year}</h2>
        <button onClick={nextMonth} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Next →</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-sm text-slate-400">Services</p>
          <p className="text-2xl font-bold text-blue-400">{counts.services}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-sm text-slate-400">Reports</p>
          <p className="text-2xl font-bold text-green-400">{counts.reports}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-sm text-slate-400">Checklists</p>
          <p className="text-2xl font-bold text-amber-400">{counts.checklists}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-sm text-slate-400">Handovers</p>
          <p className="text-2xl font-bold text-purple-400">{counts.handovers}</p>
        </div>
      </div>

      {/* Events List */}
      <div className="bg-slate-900 rounded-xl border border-slate-800">
        {sortedDates.length > 0 ? (
          sortedDates.map(date => (
            <div key={date} className="border-b border-slate-800 last:border-0">
              <div className="px-6 py-3 bg-slate-800/50">
                <span className="font-bold text-white">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="p-4 space-y-3">
                {eventsByDate[date].map(event => (
                  <div key={event.id} className="p-4 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <EventBadge type={event.type} />
                          <TeamBadge team={event.team} isCombined={event.is_combined} />
                          {event.time && <span className="text-xs text-slate-500">{event.time}</span>}
                        </div>
                        <h3 className="font-medium text-white">{event.title}</h3>
                        {event.type === 'report' && <p className="text-sm text-slate-400">Attendees: {event.attendees_count}</p>}
                        {event.type === 'checklist' && <p className="text-sm text-slate-400">Progress: {event.progress}</p>}
                        {event.type === 'handover' && (
                          <p className="text-sm text-slate-400">
                            {event.from_team} → {event.to_team} | Condition: {event.condition}
                          </p>
                        )}
                        {event.service_type && <span className="text-xs text-slate-500 capitalize">{event.service_type?.replace('_', ' ')}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <p className="text-5xl mb-4">📅</p>
            <p>No events for this month</p>
          </div>
        )}
      </div>
    </div>
  );
}
