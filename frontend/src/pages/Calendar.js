import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Calendar() {
  const { profile, demoMode } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const teamId = profile?.primary_team || 'envoy_nation';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchServices(); }, [demoMode, teamId]);

  const fetchServices = async () => {
    if (demoMode) {
      setServices([
        { id: '1', title: 'Sunday Morning Service', date: '2026-03-08', time: '11:00', type: 'sunday_service' },
        { id: '2', title: 'Tuesday Standup', date: '2026-03-10', time: '20:00', type: 'standup' },
        { id: '3', title: 'Midweek Service', date: '2026-03-11', time: '18:30', type: 'midweek' },
        { id: '4', title: 'Sunday Morning Service', date: '2026-03-15', time: '11:00', type: 'sunday_service' },
        { id: '5', title: 'Tuesday Standup', date: '2026-03-17', time: '20:00', type: 'standup' },
        { id: '6', title: 'Sunday Morning Service', date: '2026-03-22', time: '11:00', type: 'sunday_service' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('date');

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  const days = useMemo(() => {
    const result = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      result.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(i);
    }
    return result;
  }, [firstDayOfMonth, daysInMonth]);

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return services.filter(s => s.date === dateStr);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const getEventColor = (type) => {
    const colors = {
      sunday_service: 'bg-blue-500',
      midweek: 'bg-green-500',
      standup: 'bg-purple-500',
      special: 'bg-orange-500',
    };
    return colors[type] || 'bg-slate-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Calendar</h1>
        <p className="text-slate-400 mt-1">Service schedule overview</p>
      </div>

      {/* Calendar */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white"
          >
            ← Prev
          </button>
          <h2 className="text-xl font-semibold text-white">
            {monthNames[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-800 rounded-lg transition-all text-slate-400 hover:text-white"
          >
            Next →
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-800">
          {dayNames.map(day => (
            <div key={day} className="p-2 text-center text-slate-400 text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const events = getEventsForDay(day);
            return (
              <div
                key={index}
                className={`min-h-[100px] p-2 border-r border-b border-slate-800 ${
                  !day ? 'bg-slate-900/30' : 'hover:bg-slate-800/50'
                } ${isToday(day) ? 'bg-blue-500/10' : ''}`}
              >
                {day && (
                  <>
                    <span className={`inline-block w-7 h-7 text-center leading-7 rounded-full text-sm ${
                      isToday(day) ? 'bg-blue-500 text-white' : 'text-slate-300'
                    }`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {events.slice(0, 2).map((event, i) => (
                        <div
                          key={i}
                          className={`${getEventColor(event.type)} text-white text-xs p-1 rounded truncate`}
                          title={event.title}
                        >
                          {event.time} {event.title}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-slate-400 text-xs">+{events.length - 2} more</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-slate-400 text-sm">Sunday Service</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-slate-400 text-sm">Midweek</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500"></div>
          <span className="text-slate-400 text-sm">Standup</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500"></div>
          <span className="text-slate-400 text-sm">Special</span>
        </div>
      </div>
    </div>
  );
}
