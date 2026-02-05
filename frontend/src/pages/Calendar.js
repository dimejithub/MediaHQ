import { useEffect, useState } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const QUARTERS = {
  Q1: { name: 'Q1 (Jan-Mar)', months: [1, 2, 3], color: 'blue' },
  Q2: { name: 'Q2 (Apr-Jun)', months: [4, 5, 6], color: 'purple' },
  Q3: { name: 'Q3 (Jul-Sep)', months: [7, 8, 9], color: 'green' },
  Q4: { name: 'Q4 (Oct-Dec)', months: [10, 11, 12], color: 'amber' }
};

const DEMO_EVENTS = [
  { id: '1', title: 'Sunday Service', date: '2026-02-08', time: '09:00', type: 'sunday', team: 'all' },
  { id: '2', title: 'Sunday Service', date: '2026-02-15', time: '09:00', type: 'sunday', team: 'all' },
  { id: '3', title: 'Midweek Service', date: '2026-02-11', time: '18:00', type: 'midweek', team: 'envoy_nation' },
  { id: '4', title: 'Annual Conference', date: '2026-02-22', time: '09:00', type: 'conference', team: 'all' },
  { id: '5', title: 'Easter Sunday', date: '2026-04-05', time: '09:00', type: 'special', team: 'all' },
  { id: '6', title: 'Good Friday', date: '2026-04-03', time: '18:00', type: 'special', team: 'all' },
  { id: '7', title: 'Youth Sunday', date: '2026-03-01', time: '09:00', type: 'youth', team: 'all' }
];

export default function Calendar() {
  const { demoMode, user } = useAuth();
  const [year] = useState(2026);
  const [quarter, setQuarter] = useState('Q1');
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [availability, setAvailability] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '09:00', type: 'sunday', team: 'all' });

  const canManage = ['director', 'admin', 'team_lead', 'assistant_lead'].includes(user?.role);

  useEffect(() => {
    if (demoMode) {
      const saved = localStorage.getItem(`avail_${user?.user_id}`);
      if (saved) setAvailability(JSON.parse(saved));
      const savedEvents = localStorage.getItem('church_events_v2');
      if (savedEvents) setEvents(JSON.parse(savedEvents));
    }
  }, [demoMode, user?.user_id]);

  useEffect(() => {
    const q = QUARTERS[quarter];
    if (q) setSelectedMonth(q.months[0]);
  }, [quarter]);

  const saveAvailability = (newAvail) => {
    setAvailability(newAvail);
    if (demoMode) localStorage.setItem(`avail_${user?.user_id}`, JSON.stringify(newAvail));
  };

  const toggleDate = (dateStr) => {
    const curr = availability[dateStr];
    const newAvail = { ...availability };
    if (curr === undefined) newAvail[dateStr] = true;
    else if (curr === true) newAvail[dateStr] = false;
    else delete newAvail[dateStr];
    saveAvailability(newAvail);
    toast.success(newAvail[dateStr] === true ? '✓ Available' : newAvail[dateStr] === false ? '✗ Unavailable' : 'Cleared');
  };

  const markSundays = () => {
    const q = QUARTERS[quarter];
    const newAvail = { ...availability };
    const today = new Date();
    q.months.forEach(m => {
      const days = new Date(year, m, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const ds = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if (new Date(ds).getDay() === 0 && new Date(ds) >= today) newAvail[ds] = true;
      }
    });
    saveAvailability(newAvail);
    toast.success(`${quarter} Sundays marked!`);
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) { toast.error('Fill title and date'); return; }
    const ev = { ...newEvent, id: `e${Date.now()}` };
    const newEvents = [...events, ev];
    setEvents(newEvents);
    if (demoMode) localStorage.setItem('church_events_v2', JSON.stringify(newEvents));
    setShowAddModal(false);
    setNewEvent({ title: '', date: '', time: '09:00', type: 'sunday', team: 'all' });
    toast.success('Event added!');
  };

  const deleteEvent = (id) => {
    const newEvents = events.filter(e => e.id !== id);
    setEvents(newEvents);
    if (demoMode) localStorage.setItem('church_events_v2', JSON.stringify(newEvents));
    toast.success('Deleted');
  };

  // Calendar render helpers
  const daysInMonth = new Date(year, selectedMonth, 0).getDate();
  const firstDay = new Date(year, selectedMonth - 1, 1).getDay();
  const today = new Date();
  const monthEvents = events.filter(e => new Date(e.date).getMonth() + 1 === selectedMonth);

  const totalAvail = Object.values(availability).filter(v => v === true).length;
  const totalUnavail = Object.values(availability).filter(v => v === false).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8" data-testid="calendar-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Church Calendar {year}</h1>
          <p className="text-slate-400 text-sm">Plan events & set your availability</p>
        </div>
        <div className="flex gap-2">
          {canManage && <button onClick={() => setShowAddModal(true)} className="px-3 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium">+ Add Event</button>}
          <button onClick={markSundays} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Mark {quarter} Sundays</button>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">{user?.name?.[0]}</div>
          <div>
            <p className="text-white font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_',' ')}</p>
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div><p className="text-xl font-bold text-green-400">{totalAvail}</p><p className="text-xs text-slate-400">Available</p></div>
          <div><p className="text-xl font-bold text-red-400">{totalUnavail}</p><p className="text-xs text-slate-400">Unavailable</p></div>
          <div><p className="text-xl font-bold text-blue-400">{events.length}</p><p className="text-xs text-slate-400">Events</p></div>
        </div>
      </div>

      {/* Quarter Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {Object.entries(QUARTERS).map(([k, v]) => (
          <button key={k} onClick={() => setQuarter(k)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${quarter === k ? 'bg-white text-slate-900 font-medium' : 'bg-slate-800 text-slate-300'}`}>
            {v.name}
          </button>
        ))}
      </div>

      {/* Month Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {QUARTERS[quarter].months.map(m => (
          <button key={m} onClick={() => setSelectedMonth(m)}
            className={`px-4 py-2 rounded-lg text-sm ${selectedMonth === m ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>
            {MONTHS[m-1]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-4 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">{MONTHS[selectedMonth-1]} {year}</h2>
          
          {/* Legend */}
          <div className="flex gap-4 mb-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/30 border border-green-500"></span> Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500"></span> Unavailable</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-blue-500"></span> Sunday</span>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((d, i) => <div key={i} className="h-8 flex items-center justify-center text-xs text-slate-500">{d}</div>)}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="h-10"></div>)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const ds = `${year}-${String(selectedMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              const date = new Date(ds);
              const isPast = date < new Date(today.toDateString());
              const isSun = date.getDay() === 0;
              const avail = availability[ds];
              const hasEv = events.some(e => e.date === ds);

              let cls = 'h-10 rounded-lg text-sm font-medium transition-all relative ';
              if (isPast) cls += 'bg-slate-800/30 text-slate-600 cursor-not-allowed';
              else if (avail === true) cls += 'bg-green-500/30 text-green-400 border-2 border-green-500';
              else if (avail === false) cls += 'bg-red-500/30 text-red-400 border-2 border-red-500';
              else cls += 'bg-slate-800 text-white hover:bg-slate-700';
              if (isSun && !isPast) cls += ' ring-2 ring-blue-500/50';

              return (
                <button key={day} onClick={() => !isPast && toggleDate(ds)} disabled={isPast} className={cls}>
                  {day}
                  {hasEv && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events List */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">{MONTHS[selectedMonth-1]} Events</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {monthEvents.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No events this month</p>}
            {monthEvents.sort((a,b) => new Date(a.date) - new Date(b.date)).map(e => (
              <div key={e.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white font-medium text-sm">{e.title}</p>
                    <p className="text-xs text-slate-400">{e.date} • {e.time}</p>
                    <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${e.team === 'all' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {e.team === 'all' ? 'Combined' : e.team === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation'}
                    </span>
                  </div>
                  {canManage && <button onClick={() => deleteEvent(e.id)} className="text-red-400 text-xs">Delete</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Add Church Event</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Event title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
                <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                  className="p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
              </div>
              <select value={newEvent.team} onChange={e => setNewEvent({...newEvent, team: e.target.value})}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
                <option value="all">All Teams (Combined)</option>
                <option value="envoy_nation">Envoy Nation</option>
                <option value="e_nation">E-Nation</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg">Cancel</button>
              <button onClick={addEvent} className="flex-1 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
