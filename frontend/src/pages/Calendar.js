import { useEffect, useState } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// All quarters for the year
const QUARTERS = [
  { id: 'Q1', name: 'Q1 (Jan-Mar)', months: [1, 2, 3], planningStart: { month: 12, day: 15 }, planningEnd: { month: 12, day: 31 }, color: 'blue' },
  { id: 'Q2', name: 'Q2 (Apr-Jun)', months: [4, 5, 6], planningStart: { month: 3, day: 15 }, planningEnd: { month: 3, day: 31 }, color: 'purple' },
  { id: 'Q3', name: 'Q3 (Jul-Sep)', months: [7, 8, 9], planningStart: { month: 6, day: 15 }, planningEnd: { month: 6, day: 30 }, color: 'green' },
  { id: 'Q4', name: 'Q4 (Oct-Dec)', months: [10, 11, 12], planningStart: { month: 9, day: 15 }, planningEnd: { month: 9, day: 30 }, color: 'amber' }
];

const EVENT_TYPES = [
  { value: 'sunday_service', label: 'Sunday Service', color: 'bg-blue-500' },
  { value: 'midweek_service', label: 'Midweek Service', color: 'bg-cyan-500' },
  { value: 'special_service', label: 'Special Service', color: 'bg-purple-500' },
  { value: 'conference', label: 'Conference', color: 'bg-pink-500' },
  { value: 'youth_service', label: 'Youth Service', color: 'bg-green-500' },
  { value: 'prayer_meeting', label: 'Prayer Meeting', color: 'bg-amber-500' },
  { value: 'training', label: 'Training', color: 'bg-orange-500' },
  { value: 'outreach', label: 'Outreach', color: 'bg-red-500' },
  { value: 'other', label: 'Other Event', color: 'bg-slate-500' }
];

// Demo church events
const DEMO_CHURCH_EVENTS = [
  { id: 'ce_1', title: 'Sunday Morning Service', date: '2026-02-08', time: '09:00', type: 'sunday_service', recurring: true, team: 'all' },
  { id: 'ce_2', title: 'Sunday Morning Service', date: '2026-02-15', time: '09:00', type: 'sunday_service', recurring: true, team: 'all' },
  { id: 'ce_3', title: 'Sunday Morning Service', date: '2026-02-22', time: '09:00', type: 'sunday_service', recurring: true, team: 'all' },
  { id: 'ce_4', title: 'Midweek Service', date: '2026-02-11', time: '18:00', type: 'midweek_service', team: 'envoy_nation' },
  { id: 'ce_5', title: 'Annual Conference', date: '2026-02-22', time: '09:00', type: 'conference', team: 'all', description: 'Annual church conference - full day event' },
  { id: 'ce_6', title: 'Youth Sunday', date: '2026-03-01', time: '09:00', type: 'youth_service', team: 'all' },
  { id: 'ce_7', title: 'Easter Sunday', date: '2026-04-05', time: '09:00', type: 'special_service', team: 'all', description: 'Easter celebration service' },
  { id: 'ce_8', title: 'Good Friday Service', date: '2026-04-03', time: '18:00', type: 'special_service', team: 'all' },
  { id: 'ce_9', title: 'Prayer & Fasting Week', date: '2026-01-05', time: '06:00', type: 'prayer_meeting', team: 'all', description: 'Week of prayer and fasting' },
  { id: 'ce_10', title: 'Media Team Training', date: '2026-01-10', time: '10:00', type: 'training', team: 'envoy_nation', description: 'Quarterly training session' }
];

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

function isPlanningWindowOpen(quarter, today) {
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  // For Q1, planning is in December of previous year
  if (quarter.id === 'Q1') {
    return currentMonth === 12 && currentDay >= 15;
  }
  
  return currentMonth === quarter.planningStart.month && 
         currentDay >= quarter.planningStart.day && 
         currentDay <= quarter.planningEnd.day;
}

function getNextPlanningWindow(today) {
  for (const quarter of QUARTERS) {
    if (isPlanningWindowOpen(quarter, today)) {
      return { quarter, isOpen: true };
    }
  }
  
  // Find next upcoming planning window
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  
  for (const quarter of QUARTERS) {
    const planMonth = quarter.planningStart.month;
    const planDay = quarter.planningStart.day;
    
    if (planMonth > currentMonth || (planMonth === currentMonth && planDay > currentDay)) {
      const daysUntil = Math.ceil((new Date(today.getFullYear(), planMonth - 1, planDay) - today) / (1000 * 60 * 60 * 24));
      return { quarter, isOpen: false, daysUntil };
    }
  }
  
  // Next year's Q1
  return { quarter: QUARTERS[0], isOpen: false, daysUntil: null };
}

function AddEventModal({ onSave, onClose, existingEvent }) {
  const [title, setTitle] = useState(existingEvent?.title || '');
  const [date, setDate] = useState(existingEvent?.date || '');
  const [time, setTime] = useState(existingEvent?.time || '09:00');
  const [type, setType] = useState(existingEvent?.type || 'sunday_service');
  const [team, setTeam] = useState(existingEvent?.team || 'all');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [recurring, setRecurring] = useState(existingEvent?.recurring || false);

  const handleSave = () => {
    if (!title || !date) {
      toast.error('Please fill in title and date');
      return;
    }
    onSave({ id: existingEvent?.id || `ce_${Date.now()}`, title, date, time, type, team, description, recurring });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">{existingEvent ? 'Edit Event' : 'Add Church Event'}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Event Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" placeholder="e.g., Sunday Morning Service" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Event Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Team</label>
            <select value={team} onChange={(e) => setTeam(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
              <option value="all">All Teams (Combined)</option>
              <option value="envoy_nation">Envoy Nation Only</option>
              <option value="e_nation">E-Nation Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white h-20" placeholder="Optional details..." />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-800 border-slate-600" />
            <span className="text-sm text-slate-300">Recurring weekly event</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Cancel</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100">
            {existingEvent ? 'Save Changes' : 'Add Event'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onEdit, onDelete, canManage }) {
  const eventType = EVENT_TYPES.find(t => t.value === event.type) || EVENT_TYPES[EVENT_TYPES.length - 1];
  
  return (
    <div className="p-3 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`w-2 h-2 rounded-full ${eventType.color}`}></span>
            <span className="text-xs text-slate-400">{eventType.label}</span>
            {event.team === 'all' && <span className="text-xs px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-400">Combined</span>}
            {event.team === 'envoy_nation' && <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">EN</span>}
            {event.team === 'e_nation' && <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">E-N</span>}
            {event.recurring && <span className="text-xs text-slate-500">🔄</span>}
          </div>
          <h4 className="text-sm font-medium text-white">{event.title}</h4>
          <p className="text-xs text-slate-400">{event.date} • {event.time}</p>
          {event.description && <p className="text-xs text-slate-500 mt-1">{event.description}</p>}
        </div>
        {canManage && (
          <div className="flex gap-1 ml-2">
            <button onClick={() => onEdit(event)} className="text-xs text-blue-400 hover:text-blue-300 p-1">Edit</button>
            <button onClick={() => onDelete(event.id)} className="text-xs text-red-400 hover:text-red-300 p-1">×</button>
          </div>
        )}
      </div>
    </div>
  );
}

function AvailabilityCalendar({ year, month, availability, onToggle, events }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const renderDays = () => {
    const cells = [];
    
    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-9 sm:h-11"></div>);
    }
    
    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAvailable = availability[dateStr] === true;
      const isUnavailable = availability[dateStr] === false;
      const dayEvents = events.filter(e => e.date === dateStr);
      const hasEvent = dayEvents.length > 0;
      const isPast = new Date(dateStr) < new Date(new Date().toDateString());
      const isSunday = new Date(dateStr).getDay() === 0;

      cells.push(
        <button
          key={day}
          onClick={() => !isPast && onToggle(dateStr)}
          disabled={isPast}
          title={hasEvent ? dayEvents.map(e => e.title).join(', ') : ''}
          className={`h-9 sm:h-11 rounded-lg text-xs sm:text-sm font-medium transition-all relative
            ${isPast ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed' : ''}
            ${!isPast && isAvailable ? 'bg-green-500/30 text-green-400 border-2 border-green-500' : ''}
            ${!isPast && isUnavailable ? 'bg-red-500/30 text-red-400 border-2 border-red-500' : ''}
            ${!isPast && !isAvailable && !isUnavailable ? 'bg-slate-800 text-white hover:bg-slate-700' : ''}
            ${isSunday && !isPast ? 'ring-2 ring-blue-500/50' : ''}
          `}
        >
          {day}
          {hasEvent && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
              {dayEvents.slice(0, 3).map((e, i) => {
                const type = EVENT_TYPES.find(t => t.value === e.type);
                return <span key={i} className={`w-1 h-1 rounded-full ${type?.color || 'bg-blue-400'}`}></span>;
              })}
            </span>
          )}
        </button>
      );
    }
    
    return cells;
  };

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((d, i) => (
          <div key={i} className="h-6 flex items-center justify-center text-xs text-slate-500 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
    </div>
  );
}

function MonthCard({ monthData, year, quarter, availability, onToggle, events, expanded, onExpand, canManage, onAddEvent, onEditEvent, onDeleteEvent }) {
  const monthEvents = events.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() + 1 === monthData.month && d.getFullYear() === year;
  });

  const availableCount = Object.entries(availability).filter(([date, val]) => {
    const d = new Date(date);
    return d.getMonth() + 1 === monthData.month && d.getFullYear() === year && val === true;
  }).length;

  const unavailableCount = Object.entries(availability).filter(([date, val]) => {
    const d = new Date(date);
    return d.getMonth() + 1 === monthData.month && d.getFullYear() === year && val === false;
  }).length;

  const quarterColor = quarter?.color || 'blue';
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    amber: 'bg-amber-500/20 text-amber-400'
  };

  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-800 overflow-hidden transition-all ${expanded ? 'col-span-full lg:col-span-2' : ''}`}>
      <button onClick={onExpand} className="w-full p-3 sm:p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className={`px-2 py-0.5 text-xs rounded ${colors[quarterColor]}`}>{quarter?.id}</span>
          <h3 className="text-base sm:text-lg font-bold text-white">{monthData.name}</h3>
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
          {/* Legend */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 text-xs">
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
          
          {/* Calendar Grid */}
          <AvailabilityCalendar 
            year={year} 
            month={monthData.month} 
            availability={availability} 
            onToggle={onToggle}
            events={monthEvents}
          />
          
          {/* Events List */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white">Church Events</p>
              {canManage && (
                <button onClick={() => onAddEvent(monthData.month)} className="text-xs text-blue-400 hover:text-blue-300">+ Add Event</button>
              )}
            </div>
            {monthEvents.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {monthEvents.sort((a, b) => new Date(a.date) - new Date(b.date)).map(event => (
                  <EventCard key={event.id} event={event} onEdit={onEditEvent} onDelete={onDeleteEvent} canManage={canManage} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-4">No events scheduled</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Calendar() {
  const { demoMode, user, selectedTeam } = useAuth();
  const [year, setYear] = useState(2026);
  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const [events, setEvents] = useState([]);
  const [availability, setAvailability] = useState({});
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [addEventMonth, setAddEventMonth] = useState(null);

  const today = new Date();
  const planningInfo = getNextPlanningWindow(today);
  const canManageEvents = ['director', 'admin', 'team_lead', 'assistant_lead'].includes(user?.role);

  useEffect(() => {
    loadData();
  }, [demoMode, selectedTeam]);

  useEffect(() => {
    // Auto-expand first month of active quarter
    const quarter = QUARTERS.find(q => q.id === activeQuarter);
    if (quarter) {
      setExpandedMonth(quarter.months[0]);
    }
  }, [activeQuarter]);

  const loadData = () => {
    if (demoMode) {
      // Load saved events from localStorage or use demo
      const savedEvents = localStorage.getItem('church_events');
      setEvents(savedEvents ? JSON.parse(savedEvents) : DEMO_CHURCH_EVENTS);
      
      // Load availability
      const savedAvailability = localStorage.getItem(`availability_${user?.user_id}`);
      if (savedAvailability) {
        setAvailability(JSON.parse(savedAvailability));
      }
      setLoading(false);
      return;
    }
    setEvents(DEMO_CHURCH_EVENTS);
    setLoading(false);
  };

  const toggleAvailability = (dateStr) => {
    const current = availability[dateStr];
    let newValue;
    if (current === undefined) newValue = true;
    else if (current === true) newValue = false;
    else newValue = undefined;

    const newAvailability = { ...availability };
    if (newValue === undefined) delete newAvailability[dateStr];
    else newAvailability[dateStr] = newValue;
    
    setAvailability(newAvailability);
    if (demoMode) localStorage.setItem(`availability_${user?.user_id}`, JSON.stringify(newAvailability));
    toast.success(newValue === true ? 'Marked available' : newValue === false ? 'Marked unavailable' : 'Cleared');
  };

  const handleAddEvent = (month) => {
    setAddEventMonth(month);
    setEditingEvent(null);
    setShowAddEvent(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowAddEvent(true);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Delete this event?')) {
      const newEvents = events.filter(e => e.id !== eventId);
      setEvents(newEvents);
      if (demoMode) localStorage.setItem('church_events', JSON.stringify(newEvents));
      toast.success('Event deleted');
    }
  };

  const handleSaveEvent = (eventData) => {
    let newEvents;
    if (editingEvent) {
      newEvents = events.map(e => e.id === editingEvent.id ? eventData : e);
    } else {
      newEvents = [...events, eventData];
    }
    setEvents(newEvents);
    if (demoMode) localStorage.setItem('church_events', JSON.stringify(newEvents));
    setShowAddEvent(false);
    setEditingEvent(null);
    toast.success(editingEvent ? 'Event updated' : 'Event added');
  };

  const markAllSundaysAvailable = () => {
    const quarter = QUARTERS.find(q => q.id === activeQuarter);
    if (!quarter) return;
    
    const newAvailability = { ...availability };
    quarter.months.forEach(month => {
      const daysInMonth = getDaysInMonth(year, month);
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(dateStr);
        if (date.getDay() === 0 && date >= new Date(today.toDateString())) {
          newAvailability[dateStr] = true;
        }
      }
    });
    
    setAvailability(newAvailability);
    if (demoMode) localStorage.setItem(`availability_${user?.user_id}`, JSON.stringify(newAvailability));
    toast.success(`All ${activeQuarter} Sundays marked available`);
  };

  const totalAvailable = Object.values(availability).filter(v => v === true).length;
  const totalUnavailable = Object.values(availability).filter(v => v === false).length;
  const currentQuarter = QUARTERS.find(q => q.id === activeQuarter);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8" data-testid="calendar-page">
      {/* Planning Window Banner */}
      {planningInfo.isOpen && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-green-400 font-bold">Planning Window Open for {planningInfo.quarter.name}!</p>
              <p className="text-sm text-green-300">Set your availability now before the window closes.</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">Church Calendar {year}</h1>
          <p className="text-sm sm:text-base text-slate-400">Plan events & set your availability</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canManageEvents && (
            <button onClick={() => handleAddEvent(currentQuarter?.months[0])}
              className="px-3 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-100">
              + Add Event
            </button>
          )}
          <button onClick={markAllSundaysAvailable}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Mark {activeQuarter} Sundays
          </button>
        </div>
      </div>

      {/* User Stats */}
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

      {/* Instructions */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 sm:p-4 mb-6">
        <p className="text-xs sm:text-sm text-slate-300">
          <strong>📅 How to use:</strong> Click dates to toggle: <span className="text-green-400">Available</span> → <span className="text-red-400">Unavailable</span> → Clear. 
          Sundays have a <span className="text-blue-400">blue ring</span>. Event dots show scheduled services.
        </p>
      </div>

      {/* Quarter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {QUARTERS.map(q => {
          const colors = {
            blue: 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30',
            purple: 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30',
            green: 'bg-green-500/20 text-green-400 hover:bg-green-500/30',
            amber: 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          };
          const isActive = activeQuarter === q.id;
          return (
            <button
              key={q.id}
              onClick={() => setActiveQuarter(q.id)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                isActive ? `${colors[q.color]} ring-2 ring-offset-2 ring-offset-slate-950 ring-${q.color}-500/50` : colors[q.color]
              }`}
            >
              {q.name}
            </button>
          );
        })}
      </div>

      {/* Month Cards for Active Quarter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentQuarter?.months.map(month => {
          const monthData = { month, name: MONTHS[month - 1] };
          return (
            <MonthCard
              key={month}
              monthData={monthData}
              year={year}
              quarter={currentQuarter}
              availability={availability}
              onToggle={toggleAvailability}
              events={events}
              expanded={expandedMonth === month}
              onExpand={() => setExpandedMonth(expandedMonth === month ? null : month)}
              canManage={canManageEvents}
              onAddEvent={handleAddEvent}
              onEditEvent={handleEditEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          );
        })}
      </div>

      {/* Add/Edit Event Modal */}
      {showAddEvent && (
        <AddEventModal
          onSave={handleSaveEvent}
          onClose={() => { setShowAddEvent(false); setEditingEvent(null); }}
          existingEvent={editingEvent}
        />
      )}
    </div>
  );
}
