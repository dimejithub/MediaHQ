import { useEffect, useState } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const QUARTERS = [
  { id: 'Q1', name: 'Q1 (Jan-Mar)', months: [1, 2, 3], color: 'blue' },
  { id: 'Q2', name: 'Q2 (Apr-Jun)', months: [4, 5, 6], color: 'purple' },
  { id: 'Q3', name: 'Q3 (Jul-Sep)', months: [7, 8, 9], color: 'green' },
  { id: 'Q4', name: 'Q4 (Oct-Dec)', months: [10, 11, 12], color: 'amber' }
];

const EVENT_TYPES = [
  { value: 'sunday_service', label: 'Sunday Service', color: 'bg-blue-500' },
  { value: 'midweek_service', label: 'Midweek Service', color: 'bg-cyan-500' },
  { value: 'special_service', label: 'Special Service', color: 'bg-purple-500' },
  { value: 'conference', label: 'Conference', color: 'bg-pink-500' },
  { value: 'youth_service', label: 'Youth Service', color: 'bg-green-500' },
  { value: 'prayer_meeting', label: 'Prayer Meeting', color: 'bg-amber-500' },
  { value: 'training', label: 'Training', color: 'bg-orange-500' },
  { value: 'other', label: 'Other Event', color: 'bg-slate-500' }
];

const DEMO_EVENTS = [
  { id: 'ce_1', title: 'Sunday Morning Service', date: '2026-02-08', time: '09:00', type: 'sunday_service', team: 'all' },
  { id: 'ce_2', title: 'Sunday Morning Service', date: '2026-02-15', time: '09:00', type: 'sunday_service', team: 'all' },
  { id: 'ce_3', title: 'Sunday Morning Service', date: '2026-02-22', time: '09:00', type: 'sunday_service', team: 'all' },
  { id: 'ce_4', title: 'Midweek Service', date: '2026-02-11', time: '18:00', type: 'midweek_service', team: 'envoy_nation' },
  { id: 'ce_5', title: 'Annual Conference', date: '2026-02-22', time: '09:00', type: 'conference', team: 'all' },
  { id: 'ce_6', title: 'Youth Sunday', date: '2026-03-01', time: '09:00', type: 'youth_service', team: 'all' },
  { id: 'ce_7', title: 'Easter Sunday', date: '2026-04-05', time: '09:00', type: 'special_service', team: 'all' },
  { id: 'ce_8', title: 'Good Friday', date: '2026-04-03', time: '18:00', type: 'special_service', team: 'all' },
  { id: 'ce_9', title: 'Media Training', date: '2026-01-10', time: '10:00', type: 'training', team: 'envoy_nation' }
];

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

function AddEventModal({ onSave, onClose, existingEvent }) {
  const [title, setTitle] = useState(existingEvent?.title || '');
  const [date, setDate] = useState(existingEvent?.date || '');
  const [time, setTime] = useState(existingEvent?.time || '09:00');
  const [type, setType] = useState(existingEvent?.type || 'sunday_service');
  const [team, setTeam] = useState(existingEvent?.team || 'all');

  const handleSave = () => {
    if (!title || !date) {
      toast.error('Please fill in title and date');
      return;
    }
    onSave({ id: existingEvent?.id || `ce_${Date.now()}`, title, date, time, type, team });
  };

  const typeOptions = EVENT_TYPES.map(t => (
    <option key={t.value} value={t.value}>{t.label}</option>
  ));

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">{existingEvent ? 'Edit Event' : 'Add Church Event'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">Event Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" placeholder="e.g., Sunday Service" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-300 mb-1">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Event Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
              {typeOptions}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-1">Team</label>
            <select value={team} onChange={(e) => setTeam(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
              <option value="all">All Teams (Combined)</option>
              <option value="envoy_nation">Envoy Nation Only</option>
              <option value="e_nation">E-Nation Only</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Cancel</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100">Save</button>
        </div>
      </div>
    </div>
  );
}

function EventItem({ event, onEdit, onDelete, canManage }) {
  const eventType = EVENT_TYPES.find(t => t.value === event.type) || EVENT_TYPES[7];
  const teamLabel = event.team === 'all' ? 'Combined' : event.team === 'envoy_nation' ? 'EN' : 'E-N';
  const teamColor = event.team === 'all' ? 'bg-pink-500/20 text-pink-400' : 
                    event.team === 'envoy_nation' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400';
  
  return (
    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${eventType.color}`}></span>
            <span className="text-xs text-slate-400">{eventType.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${teamColor}`}>{teamLabel}</span>
          </div>
          <h4 className="text-sm font-medium text-white">{event.title}</h4>
          <p className="text-xs text-slate-400">{event.date} • {event.time}</p>
        </div>
        {canManage && (
          <div className="flex gap-1">
            <button onClick={() => onEdit(event)} className="text-xs text-blue-400 p-1">Edit</button>
            <button onClick={() => onDelete(event.id)} className="text-xs text-red-400 p-1">×</button>
          </div>
        )}
      </div>
    </div>
  );
}

function DayCell({ day, dateStr, availability, events, isPast, isSunday, onToggle }) {
  const isAvailable = availability[dateStr] === true;
  const isUnavailable = availability[dateStr] === false;
  const hasEvents = events.length > 0;
  
  let className = 'h-9 sm:h-11 rounded-lg text-xs sm:text-sm font-medium transition-all relative ';
  
  if (isPast) {
    className += 'bg-slate-800/30 text-slate-600 cursor-not-allowed';
  } else if (isAvailable) {
    className += 'bg-green-500/30 text-green-400 border-2 border-green-500';
  } else if (isUnavailable) {
    className += 'bg-red-500/30 text-red-400 border-2 border-red-500';
  } else {
    className += 'bg-slate-800 text-white hover:bg-slate-700';
  }
  
  if (isSunday && !isPast) {
    className += ' ring-2 ring-blue-500/50';
  }

  return (
    <button onClick={() => !isPast && onToggle(dateStr)} disabled={isPast} className={className}>
      {day}
      {hasEvents && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
    </button>
  );
}

function CalendarGrid({ year, month, availability, events, onToggle }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const today = new Date();
  
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const renderWeekDays = () => {
    return weekDays.map((d, i) => (
      <div key={i} className="h-6 flex items-center justify-center text-xs text-slate-500 font-medium">{d}</div>
    ));
  };
  
  const renderEmptyCells = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-9 sm:h-11"></div>);
    }
    return cells;
  };
  
  const renderDayCells = () => {
    const cells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const date = new Date(dateStr);
      const isPast = date < new Date(today.toDateString());
      const isSunday = date.getDay() === 0;
      const dayEvents = events.filter(e => e.date === dateStr);
      
      cells.push(
        <DayCell 
          key={day} 
          day={day} 
          dateStr={dateStr} 
          availability={availability}
          events={dayEvents}
          isPast={isPast}
          isSunday={isSunday}
          onToggle={onToggle}
        />
      );
    }
    return cells;
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">{renderWeekDays()}</div>
      <div className="grid grid-cols-7 gap-1">
        {renderEmptyCells()}
        {renderDayCells()}
      </div>
    </div>
  );
}

function MonthCard({ month, monthName, year, quarter, availability, events, expanded, onExpand, onToggle, canManage, onAddEvent, onEditEvent, onDeleteEvent }) {
  const monthEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const availableCount = Object.entries(availability).filter(([date, val]) => {
    const d = new Date(date);
    return d.getMonth() + 1 === month && d.getFullYear() === year && val === true;
  }).length;

  const unavailableCount = Object.entries(availability).filter(([date, val]) => {
    const d = new Date(date);
    return d.getMonth() + 1 === month && d.getFullYear() === year && val === false;
  }).length;

  const colorClass = quarter.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                     quarter.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                     quarter.color === 'green' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400';

  const renderEventsList = () => {
    if (monthEvents.length === 0) {
      return <p className="text-sm text-slate-500 text-center py-4">No events scheduled</p>;
    }
    
    const sortedEvents = monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    return sortedEvents.map(event => (
      <EventItem key={event.id} event={event} onEdit={onEditEvent} onDelete={onDeleteEvent} canManage={canManage} />
    ));
  };

  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-800 overflow-hidden ${expanded ? 'col-span-full lg:col-span-2' : ''}`}>
      <button onClick={onExpand} className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-800/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`px-2 py-0.5 text-xs rounded ${colorClass}`}>{quarter.id}</span>
          <h3 className="text-base sm:text-lg font-bold text-white">{monthName}</h3>
          <span className="text-xs text-slate-500">{monthEvents.length} events</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {availableCount > 0 && <span className="text-xs text-green-400">{availableCount}✓</span>}
          {unavailableCount > 0 && <span className="text-xs text-red-400">{unavailableCount}✗</span>}
          <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>
      
      {expanded && (
        <div className="p-3 sm:p-4 border-t border-slate-800">
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500"></span> Available
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500"></span> Unavailable
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-3 h-3 rounded ring-2 ring-blue-500/50"></span> Sunday
            </span>
          </div>
          
          <CalendarGrid year={year} month={month} availability={availability} events={monthEvents} onToggle={onToggle} />
          
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">Church Events</p>
              {canManage && <button onClick={() => onAddEvent(month)} className="text-xs text-blue-400">+ Add</button>}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {renderEventsList()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Calendar() {
  const { demoMode, user } = useAuth();
  const [year] = useState(2026);
  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const [events, setEvents] = useState([]);
  const [availability, setAvailability] = useState({});
  const [expandedMonth, setExpandedMonth] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const canManageEvents = ['director', 'admin', 'team_lead', 'assistant_lead'].includes(user?.role);
  const currentQuarter = QUARTERS.find(q => q.id === activeQuarter);

  useEffect(() => {
    if (demoMode) {
      const savedEvents = localStorage.getItem('church_events');
      setEvents(savedEvents ? JSON.parse(savedEvents) : DEMO_EVENTS);
      const savedAvail = localStorage.getItem(`availability_${user?.user_id}`);
      if (savedAvail) setAvailability(JSON.parse(savedAvail));
    } else {
      setEvents(DEMO_EVENTS);
    }
    setLoading(false);
  }, [demoMode, user?.user_id]);

  useEffect(() => {
    const quarter = QUARTERS.find(q => q.id === activeQuarter);
    if (quarter) setExpandedMonth(quarter.months[0]);
  }, [activeQuarter]);

  const toggleAvailability = (dateStr) => {
    const current = availability[dateStr];
    let newVal = current === undefined ? true : current === true ? false : undefined;
    
    const newAvail = { ...availability };
    if (newVal === undefined) delete newAvail[dateStr];
    else newAvail[dateStr] = newVal;
    
    setAvailability(newAvail);
    if (demoMode) localStorage.setItem(`availability_${user?.user_id}`, JSON.stringify(newAvail));
    toast.success(newVal === true ? 'Available' : newVal === false ? 'Unavailable' : 'Cleared');
  };

  const handleSaveEvent = (eventData) => {
    let newEvents = editingEvent 
      ? events.map(e => e.id === editingEvent.id ? eventData : e)
      : [...events, eventData];
    setEvents(newEvents);
    if (demoMode) localStorage.setItem('church_events', JSON.stringify(newEvents));
    setShowAddEvent(false);
    setEditingEvent(null);
    toast.success('Event saved');
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Delete this event?')) {
      const newEvents = events.filter(e => e.id !== eventId);
      setEvents(newEvents);
      if (demoMode) localStorage.setItem('church_events', JSON.stringify(newEvents));
      toast.success('Deleted');
    }
  };

  const markAllSundaysAvailable = () => {
    if (!currentQuarter) return;
    const newAvail = { ...availability };
    const today = new Date();
    
    currentQuarter.months.forEach(m => {
      const days = getDaysInMonth(year, m);
      for (let d = 1; d <= days; d++) {
        const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const date = new Date(dateStr);
        if (date.getDay() === 0 && date >= new Date(today.toDateString())) {
          newAvail[dateStr] = true;
        }
      }
    });
    
    setAvailability(newAvail);
    if (demoMode) localStorage.setItem(`availability_${user?.user_id}`, JSON.stringify(newAvail));
    toast.success(`${activeQuarter} Sundays marked`);
  };

  const totalAvailable = Object.values(availability).filter(v => v === true).length;
  const totalUnavailable = Object.values(availability).filter(v => v === false).length;

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400">Loading...</div></div>;

  const renderQuarterTabs = () => {
    return QUARTERS.map(q => {
      const colorClass = q.color === 'blue' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' :
                         q.color === 'purple' ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' :
                         q.color === 'green' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30';
      const isActive = activeQuarter === q.id;
      return (
        <button key={q.id} onClick={() => setActiveQuarter(q.id)}
          className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium ${colorClass} ${isActive ? 'ring-2 ring-offset-2 ring-offset-slate-950' : ''}`}>
          {q.name}
        </button>
      );
    });
  };

  const renderMonthCards = () => {
    if (!currentQuarter) return null;
    return currentQuarter.months.map(m => (
      <MonthCard
        key={m}
        month={m}
        monthName={MONTHS[m - 1]}
        year={year}
        quarter={currentQuarter}
        availability={availability}
        events={events}
        expanded={expandedMonth === m}
        onExpand={() => setExpandedMonth(expandedMonth === m ? null : m)}
        onToggle={toggleAvailability}
        canManage={canManageEvents}
        onAddEvent={() => { setEditingEvent(null); setShowAddEvent(true); }}
        onEditEvent={(e) => { setEditingEvent(e); setShowAddEvent(true); }}
        onDeleteEvent={handleDeleteEvent}
      />
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" data-testid="calendar-page">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">Church Calendar {year}</h1>
          <p className="text-sm sm:text-base text-slate-400">Plan events & set availability</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageEvents && (
            <button onClick={() => { setEditingEvent(null); setShowAddEvent(true); }}
              className="px-3 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium">+ Add Event</button>
          )}
          <button onClick={markAllSundaysAvailable}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Mark {activeQuarter} Sundays</button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-lg font-bold text-white">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="text-white font-medium">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{totalAvailable}</p>
              <p className="text-xs text-slate-400">Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{totalUnavailable}</p>
              <p className="text-xs text-slate-400">Unavailable</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-400">{events.length}</p>
              <p className="text-xs text-slate-400">Events</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 mb-6">
        <p className="text-xs sm:text-sm text-slate-300">
          <strong>📅 Instructions:</strong> Click dates: <span className="text-green-400">Available</span> → <span className="text-red-400">Unavailable</span> → Clear. Sundays have <span className="text-blue-400">blue rings</span>.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">{renderQuarterTabs()}</div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{renderMonthCards()}</div>

      {showAddEvent && (
        <AddEventModal onSave={handleSaveEvent} onClose={() => { setShowAddEvent(false); setEditingEvent(null); }} existingEvent={editingEvent} />
      )}
    </div>
  );
}
