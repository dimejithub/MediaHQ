import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Demo calendar events based on actual church services
const DEMO_EVENTS = [
  // Envoy Nation - Sunday Services (11am)
  { id: 'en_sun_1', title: 'Sunday Service (Envoy Nation)', date: '2026-02-08', time: '11:00', team: 'envoy_nation', type: 'sunday_service' },
  { id: 'en_sun_2', title: 'Sunday Service (Envoy Nation)', date: '2026-02-15', time: '11:00', team: 'envoy_nation', type: 'sunday_service' },
  { id: 'en_sun_3', title: 'Sunday Service (Envoy Nation)', date: '2026-02-22', time: '11:00', team: 'envoy_nation', type: 'sunday_service' },
  { id: 'en_sun_4', title: 'Sunday Service (Envoy Nation)', date: '2026-03-01', time: '11:00', team: 'envoy_nation', type: 'sunday_service' },
  
  // Envoy Nation - Midweek (Leicester Blessings) (Thursdays 7pm)
  { id: 'en_mw_1', title: 'Midweek (Leicester Blessings)', date: '2026-02-05', time: '19:00', team: 'envoy_nation', type: 'midweek_service' },
  { id: 'en_mw_2', title: 'Midweek (Leicester Blessings)', date: '2026-02-12', time: '19:00', team: 'envoy_nation', type: 'midweek_service' },
  { id: 'en_mw_3', title: 'Midweek (Leicester Blessings)', date: '2026-02-19', time: '19:00', team: 'envoy_nation', type: 'midweek_service' },
  
  // Envoy Nation - Connected with PMO (Last Thursday)
  { id: 'en_pmo_1', title: 'Connected with PMO', date: '2026-02-26', time: '19:00', team: 'envoy_nation', type: 'connected_pmo' },
  { id: 'en_pmo_2', title: 'Connected with PMO', date: '2026-03-26', time: '19:00', team: 'envoy_nation', type: 'connected_pmo' },
  
  // Envoy Nation - Tuesday Standups (7pm)
  { id: 'en_tu_1', title: 'Tuesday Standup', date: '2026-02-03', time: '19:00', team: 'envoy_nation', type: 'tuesday_standup' },
  { id: 'en_tu_2', title: 'Tuesday Standup', date: '2026-02-10', time: '19:00', team: 'envoy_nation', type: 'tuesday_standup' },
  { id: 'en_tu_3', title: 'Tuesday Standup', date: '2026-02-17', time: '19:00', team: 'envoy_nation', type: 'tuesday_standup' },
  { id: 'en_tu_4', title: 'Tuesday Standup', date: '2026-02-24', time: '19:00', team: 'envoy_nation', type: 'tuesday_standup' },
  
  // E-Nation (The Commissioned Envoy) - Sunday Services (2pm)
  { id: 'e_sun_1', title: 'The Commissioned Envoy', date: '2026-02-08', time: '14:00', team: 'e_nation', type: 'sunday_service' },
  { id: 'e_sun_2', title: 'The Commissioned Envoy', date: '2026-02-15', time: '14:00', team: 'e_nation', type: 'sunday_service' },
  { id: 'e_sun_3', title: 'The Commissioned Envoy', date: '2026-02-22', time: '14:00', team: 'e_nation', type: 'sunday_service' },
  { id: 'e_sun_4', title: 'The Commissioned Envoy', date: '2026-03-01', time: '14:00', team: 'e_nation', type: 'sunday_service' },
  
  // E-Nation - Midweek Services (Wednesdays 7pm)
  { id: 'e_mid_1', title: 'E-Nation Midweek', date: '2026-02-04', time: '19:00', team: 'e_nation', type: 'midweek_service' },
  { id: 'e_mid_2', title: 'E-Nation Midweek', date: '2026-02-11', time: '19:00', team: 'e_nation', type: 'midweek_service' },
  { id: 'e_mid_3', title: 'E-Nation Midweek', date: '2026-02-18', time: '19:00', team: 'e_nation', type: 'midweek_service' },
  { id: 'e_mid_4', title: 'E-Nation Midweek', date: '2026-02-25', time: '19:00', team: 'e_nation', type: 'midweek_service' },
  
  // E-Nation - Tuesday Standups (7pm)
  { id: 'e_tu_1', title: 'Tuesday Standup', date: '2026-02-03', time: '19:00', team: 'e_nation', type: 'tuesday_standup' },
  { id: 'e_tu_2', title: 'Tuesday Standup', date: '2026-02-10', time: '19:00', team: 'e_nation', type: 'tuesday_standup' },
  { id: 'e_tu_3', title: 'Tuesday Standup', date: '2026-02-17', time: '19:00', team: 'e_nation', type: 'tuesday_standup' },
  { id: 'e_tu_4', title: 'Tuesday Standup', date: '2026-02-24', time: '19:00', team: 'e_nation', type: 'tuesday_standup' }
];

function CalendarDay({ day, dateStr, availability, hasEvent, isPast, isSunday, onToggle }) {
  const avail = availability[dateStr];
  
  let cls = 'h-10 rounded-lg text-sm font-medium transition-all relative ';
  if (isPast) {
    cls += 'bg-slate-800/30 text-slate-600 cursor-not-allowed';
  } else if (avail === true) {
    cls += 'bg-green-500/30 text-green-400 border-2 border-green-500';
  } else if (avail === false) {
    cls += 'bg-red-500/30 text-red-400 border-2 border-red-500';
  } else {
    cls += 'bg-slate-800 text-white hover:bg-slate-700';
  }
  if (isSunday && !isPast) {
    cls += ' ring-2 ring-blue-500/50';
  }

  return (
    <button onClick={() => !isPast && onToggle(dateStr)} disabled={isPast} className={cls}>
      {day}
      {hasEvent && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
    </button>
  );
}

function CalendarGrid({ year, month, availability, events, onToggle }) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const today = new Date();
  
  const emptyCells = useMemo(() => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e${i}`} className="h-10"></div>);
    }
    return cells;
  }, [firstDay]);

  const dayCells = useMemo(() => {
    const cells = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const date = new Date(dateStr);
      const isPast = date < new Date(today.toDateString());
      const isSunday = date.getDay() === 0;
      const hasEvent = events.some(e => e.date === dateStr);
      
      cells.push(
        <CalendarDay 
          key={d}
          day={d}
          dateStr={dateStr}
          availability={availability}
          hasEvent={hasEvent}
          isPast={isPast}
          isSunday={isSunday}
          onToggle={onToggle}
        />
      );
    }
    return cells;
  }, [year, month, daysInMonth, availability, events, onToggle]);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        <div className="h-8 flex items-center justify-center text-xs text-slate-500">S</div>
        <div className="h-8 flex items-center justify-center text-xs text-slate-500">M</div>
        <div className="h-8 flex items-center justify-center text-xs text-slate-500">T</div>
        <div className="h-8 flex items-center justify-center text-xs text-slate-500">W</div>
        <div className="h-8 flex items-center justify-center text-xs text-slate-500">T</div>
        <div className="h-8 flex items-center justify-center text-xs text-slate-500">F</div>
        <div className="h-8 flex items-center justify-center text-xs text-slate-500">S</div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {emptyCells}
        {dayCells}
      </div>
    </div>
  );
}

function EventCard({ event, onDelete, canManage }) {
  const teamLabel = event.team === 'all' ? 'Combined' : event.team === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';
  const teamColor = event.team === 'all' ? 'bg-pink-500/20 text-pink-400' : 'bg-blue-500/20 text-blue-400';
  
  return (
    <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-white font-medium text-sm">{event.title}</p>
          <p className="text-xs text-slate-400">{event.date} • {event.time}</p>
          <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block ${teamColor}`}>{teamLabel}</span>
        </div>
        {canManage && <button onClick={() => onDelete(event.id)} className="text-red-400 text-xs">Delete</button>}
      </div>
    </div>
  );
}

export default function Calendar() {
  const { demoMode, user } = useAuth();
  const [year] = useState(2026);
  const [quarter, setQuarter] = useState('Q1');
  const [month, setMonth] = useState(1);
  const [events, setEvents] = useState(DEMO_EVENTS);
  const [availability, setAvailability] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newTeam, setNewTeam] = useState('all');

  const canManage = ['director', 'admin', 'team_lead', 'assistant_lead'].includes(user?.role);
  
  const quarterMonths = quarter === 'Q1' ? [1,2,3] : quarter === 'Q2' ? [4,5,6] : quarter === 'Q3' ? [7,8,9] : [10,11,12];
  const monthEvents = events.filter(e => new Date(e.date).getMonth() + 1 === month);
  const totalAvail = Object.values(availability).filter(v => v === true).length;
  const totalUnavail = Object.values(availability).filter(v => v === false).length;

  useEffect(() => {
    if (demoMode) {
      const saved = localStorage.getItem(`avail_${user?.user_id}`);
      if (saved) setAvailability(JSON.parse(saved));
      const savedEv = localStorage.getItem('church_events_v3');
      if (savedEv) setEvents(JSON.parse(savedEv));
    }
  }, [demoMode, user?.user_id]);

  useEffect(() => {
    setMonth(quarterMonths[0]);
  }, [quarter]);

  const toggleDate = (dateStr) => {
    const curr = availability[dateStr];
    const newAvail = { ...availability };
    if (curr === undefined) newAvail[dateStr] = true;
    else if (curr === true) newAvail[dateStr] = false;
    else delete newAvail[dateStr];
    setAvailability(newAvail);
    if (demoMode) localStorage.setItem(`avail_${user?.user_id}`, JSON.stringify(newAvail));
    toast.success(newAvail[dateStr] === true ? '✓ Available' : newAvail[dateStr] === false ? '✗ Unavailable' : 'Cleared');
  };

  const markSundays = () => {
    const newAvail = { ...availability };
    const today = new Date();
    quarterMonths.forEach(m => {
      const days = new Date(year, m, 0).getDate();
      for (let d = 1; d <= days; d++) {
        const ds = `${year}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        if (new Date(ds).getDay() === 0 && new Date(ds) >= today) newAvail[ds] = true;
      }
    });
    setAvailability(newAvail);
    if (demoMode) localStorage.setItem(`avail_${user?.user_id}`, JSON.stringify(newAvail));
    toast.success(`${quarter} Sundays marked!`);
  };

  const addEvent = () => {
    if (!newTitle || !newDate) { toast.error('Fill title and date'); return; }
    const ev = { id: `e${Date.now()}`, title: newTitle, date: newDate, time: newTime, team: newTeam };
    const newEvents = [...events, ev];
    setEvents(newEvents);
    if (demoMode) localStorage.setItem('church_events_v3', JSON.stringify(newEvents));
    setShowModal(false);
    setNewTitle(''); setNewDate(''); setNewTime('09:00'); setNewTeam('all');
    toast.success('Event added!');
  };

  const deleteEvent = (id) => {
    const newEvents = events.filter(e => e.id !== id);
    setEvents(newEvents);
    if (demoMode) localStorage.setItem('church_events_v3', JSON.stringify(newEvents));
    toast.success('Deleted');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" data-testid="calendar-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Church Calendar {year}</h1>
          <p className="text-slate-400 text-sm">Plan events & availability</p>
        </div>
        <div className="flex gap-2">
          {canManage && <button onClick={() => setShowModal(true)} className="px-3 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium">+ Add Event</button>}
          <button onClick={markSundays} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Mark {quarter} Sundays</button>
        </div>
      </div>

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

      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button onClick={() => setQuarter('Q1')} className={`px-4 py-2 rounded-lg text-sm ${quarter === 'Q1' ? 'bg-white text-slate-900 font-medium' : 'bg-slate-800 text-slate-300'}`}>Q1 (Jan-Mar)</button>
        <button onClick={() => setQuarter('Q2')} className={`px-4 py-2 rounded-lg text-sm ${quarter === 'Q2' ? 'bg-white text-slate-900 font-medium' : 'bg-slate-800 text-slate-300'}`}>Q2 (Apr-Jun)</button>
        <button onClick={() => setQuarter('Q3')} className={`px-4 py-2 rounded-lg text-sm ${quarter === 'Q3' ? 'bg-white text-slate-900 font-medium' : 'bg-slate-800 text-slate-300'}`}>Q3 (Jul-Sep)</button>
        <button onClick={() => setQuarter('Q4')} className={`px-4 py-2 rounded-lg text-sm ${quarter === 'Q4' ? 'bg-white text-slate-900 font-medium' : 'bg-slate-800 text-slate-300'}`}>Q4 (Oct-Dec)</button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button onClick={() => setMonth(quarterMonths[0])} className={`px-4 py-2 rounded-lg text-sm ${month === quarterMonths[0] ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{MONTHS[quarterMonths[0]-1]}</button>
        <button onClick={() => setMonth(quarterMonths[1])} className={`px-4 py-2 rounded-lg text-sm ${month === quarterMonths[1] ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{MONTHS[quarterMonths[1]-1]}</button>
        <button onClick={() => setMonth(quarterMonths[2])} className={`px-4 py-2 rounded-lg text-sm ${month === quarterMonths[2] ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'}`}>{MONTHS[quarterMonths[2]-1]}</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-4 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">{MONTHS[month-1]} {year}</h2>
          <div className="flex gap-4 mb-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/30 border border-green-500"></span> Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500/30 border border-red-500"></span> Unavailable</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-2 ring-blue-500"></span> Sunday</span>
          </div>
          <CalendarGrid year={year} month={month} availability={availability} events={events} onToggle={toggleDate} />
        </div>

        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">{MONTHS[month-1]} Events</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {monthEvents.length === 0 && <p className="text-slate-500 text-sm text-center py-8">No events</p>}
            {monthEvents.map(e => <EventCard key={e.id} event={e} onDelete={deleteEvent} canManage={canManage} />)}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Add Church Event</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Event title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
                <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
              </div>
              <select value={newTeam} onChange={e => setNewTeam(e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
                <option value="all">All Teams (Combined)</option>
                <option value="envoy_nation">Envoy Nation</option>
                <option value="e_nation">E-Nation</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg">Cancel</button>
              <button onClick={addEvent} className="flex-1 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
