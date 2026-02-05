import { useEffect, useState } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Q1 and Q2 months for 2026
const Q1_Q2_MONTHS = [
  { month: 1, name: 'January', quarter: 'Q1' },
  { month: 2, name: 'February', quarter: 'Q1' },
  { month: 3, name: 'March', quarter: 'Q1' },
  { month: 4, name: 'April', quarter: 'Q2' },
  { month: 5, name: 'May', quarter: 'Q2' },
  { month: 6, name: 'June', quarter: 'Q2' }
];

const DEMO_EVENTS = [
  { id: 'demo_s1', type: 'service', title: 'Sunday Morning Service', date: '2026-02-08', time: '11:00', team: 'envoy_nation' },
  { id: 'demo_s2', type: 'service', title: 'E-Nation Sunday Service', date: '2026-02-08', time: '09:00', team: 'e_nation' },
  { id: 'demo_s3', type: 'service', title: 'Midweek Service', date: '2026-02-12', time: '18:00', team: 'envoy_nation' },
  { id: 'demo_e1', type: 'service', title: 'Annual Conference', date: '2026-02-22', time: '09:00', is_combined: true }
];

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

function AvailabilityCalendar({ year, month, availability, onToggle, events }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const days = [];
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Add empty cells for days before the first day
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-10 sm:h-12"></div>);
  }

  // Add days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isAvailable = availability[dateStr] === true;
    const isUnavailable = availability[dateStr] === false;
    const hasEvent = events.some(e => e.date === dateStr);
    const isPast = new Date(dateStr) < new Date(new Date().toDateString());
    const isSunday = new Date(dateStr).getDay() === 0;

    days.push(
      <button
        key={day}
        onClick={() => !isPast && onToggle(dateStr)}
        disabled={isPast}
        className={`h-10 sm:h-12 rounded-lg text-xs sm:text-sm font-medium transition-all relative
          ${isPast ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed' : ''}
          ${!isPast && isAvailable ? 'bg-green-500/30 text-green-400 border-2 border-green-500' : ''}
          ${!isPast && isUnavailable ? 'bg-red-500/30 text-red-400 border-2 border-red-500' : ''}
          ${!isPast && !isAvailable && !isUnavailable ? 'bg-slate-800 text-white hover:bg-slate-700' : ''}
          ${isSunday && !isPast ? 'ring-2 ring-blue-500/50' : ''}
        `}
      >
        {day}
        {hasEvent && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
      </button>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(d => (
          <div key={d} className="h-8 flex items-center justify-center text-xs text-slate-500 font-medium">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}

function MonthCard({ monthData, year, availability, onToggle, events, expanded, onExpand }) {
  const monthEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate.getMonth() + 1 === monthData.month && eventDate.getFullYear() === year;
  });

  const availableDays = Object.entries(availability).filter(([date, val]) => {
    const d = new Date(date);
    return d.getMonth() + 1 === monthData.month && d.getFullYear() === year && val === true;
  }).length;

  const unavailableDays = Object.entries(availability).filter(([date, val]) => {
    const d = new Date(date);
    return d.getMonth() + 1 === monthData.month && d.getFullYear() === year && val === false;
  }).length;

  return (
    <div className={`bg-slate-900 rounded-xl border border-slate-800 overflow-hidden transition-all ${expanded ? 'col-span-full' : ''}`}>
      <button 
        onClick={onExpand}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-xs rounded ${monthData.quarter === 'Q1' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
            {monthData.quarter}
          </span>
          <h3 className="text-lg font-bold text-white">{monthData.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          {availableDays > 0 && <span className="text-xs text-green-400">{availableDays} available</span>}
          {unavailableDays > 0 && <span className="text-xs text-red-400">{unavailableDays} unavailable</span>}
          <span className="text-slate-400">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>
      
      {expanded && (
        <div className="p-4 border-t border-slate-800">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500"></span> Available
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500"></span> Unavailable
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-3 h-3 rounded bg-slate-800 ring-2 ring-blue-500/50"></span> Sunday
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Has event
            </span>
          </div>
          <AvailabilityCalendar 
            year={year} 
            month={monthData.month} 
            availability={availability} 
            onToggle={onToggle}
            events={monthEvents}
          />
          {monthEvents.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="text-sm text-slate-400 mb-2">Events this month:</p>
              <div className="space-y-2">
                {monthEvents.map(e => (
                  <div key={e.id} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500">{new Date(e.date).getDate()}</span>
                    <span className="text-white">{e.title}</span>
                    {e.time && <span className="text-slate-500">{e.time}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Calendar() {
  const { demoMode, user, selectedTeam } = useAuth();
  const [view, setView] = useState('availability'); // 'availability' or 'events'
  const [year] = useState(2026);
  const [events, setEvents] = useState([]);
  const [availability, setAvailability] = useState({});
  const [expandedMonth, setExpandedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [demoMode, selectedTeam]);

  const loadData = () => {
    if (demoMode) {
      setEvents(DEMO_EVENTS);
      // Load saved availability from localStorage
      const saved = localStorage.getItem(`availability_${user?.user_id}`);
      if (saved) {
        setAvailability(JSON.parse(saved));
      }
      setLoading(false);
      return;
    }

    // Real API call would go here
    setEvents(DEMO_EVENTS);
    setLoading(false);
  };

  const toggleAvailability = (dateStr) => {
    const current = availability[dateStr];
    let newValue;
    
    if (current === undefined) {
      newValue = true; // First click = available
    } else if (current === true) {
      newValue = false; // Second click = unavailable
    } else {
      newValue = undefined; // Third click = unset
    }

    const newAvailability = { ...availability };
    if (newValue === undefined) {
      delete newAvailability[dateStr];
    } else {
      newAvailability[dateStr] = newValue;
    }
    
    setAvailability(newAvailability);
    
    // Save to localStorage in demo mode
    if (demoMode) {
      localStorage.setItem(`availability_${user?.user_id}`, JSON.stringify(newAvailability));
    }
    
    toast.success(newValue === true ? 'Marked as available' : newValue === false ? 'Marked as unavailable' : 'Availability cleared');
  };

  const markAllSundaysAvailable = () => {
    const newAvailability = { ...availability };
    
    Q1_Q2_MONTHS.forEach(m => {
      const daysInMonth = getDaysInMonth(year, m.month);
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(m.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const date = new Date(dateStr);
        if (date.getDay() === 0 && date >= new Date(new Date().toDateString())) {
          newAvailability[dateStr] = true;
        }
      }
    });
    
    setAvailability(newAvailability);
    if (demoMode) {
      localStorage.setItem(`availability_${user?.user_id}`, JSON.stringify(newAvailability));
    }
    toast.success('All Sundays marked as available');
  };

  const clearAllAvailability = () => {
    setAvailability({});
    if (demoMode) {
      localStorage.removeItem(`availability_${user?.user_id}`);
    }
    toast.success('Availability cleared');
  };

  // Count stats
  const totalAvailable = Object.values(availability).filter(v => v === true).length;
  const totalUnavailable = Object.values(availability).filter(v => v === false).length;

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading calendar...</div></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8" data-testid="calendar-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">Availability Calendar</h1>
          <p className="text-sm sm:text-base text-slate-400">Plan your availability for Q1 & Q2 {year}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={markAllSundaysAvailable}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all"
          >
            Mark All Sundays
          </button>
          <button
            onClick={clearAllAvailability}
            className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600 transition-all"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* User Info */}
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
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{totalAvailable}</p>
              <p className="text-xs text-slate-400">Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{totalUnavailable}</p>
              <p className="text-xs text-slate-400">Unavailable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-400">
          <strong>How to use:</strong> Click a date once to mark as <span className="text-green-400">available</span>, 
          click again for <span className="text-red-400">unavailable</span>, click a third time to clear. 
          Sundays are highlighted with a blue ring.
        </p>
      </div>

      {/* Quarter Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setExpandedMonth(Q1_Q2_MONTHS.find(m => m.quarter === 'Q1')?.month || 1)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
        >
          Q1 (Jan-Mar)
        </button>
        <button
          onClick={() => setExpandedMonth(Q1_Q2_MONTHS.find(m => m.quarter === 'Q2')?.month || 4)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
        >
          Q2 (Apr-Jun)
        </button>
      </div>

      {/* Month Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Q1_Q2_MONTHS.map(monthData => (
          <MonthCard
            key={monthData.month}
            monthData={monthData}
            year={year}
            availability={availability}
            onToggle={toggleAvailability}
            events={events}
            expanded={expandedMonth === monthData.month}
            onExpand={() => setExpandedMonth(expandedMonth === monthData.month ? null : monthData.month)}
          />
        ))}
      </div>
    </div>
  );
}
