import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Notifications() {
  const { profile, demoMode } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (demoMode) {
        setNotifications([
          { id: 1, title: 'Rota Assignment', message: 'You have been assigned to Sunday Morning Service', type: 'info', read: false, created_at: new Date().toISOString() },
          { id: 2, title: 'Equipment Return', message: 'Please return the wireless microphone', type: 'warning', read: false, created_at: new Date(Date.now() - 86400000).toISOString() },
          { id: 3, title: 'Attendance Reminder', message: 'Don\'t forget the Tuesday standup meeting', type: 'info', read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
        ]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile?.user_id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [profile, demoMode]);

  const markAsRead = async (id) => {
    if (demoMode) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      return;
    }

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 mt-1">Stay updated with team activities</p>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-800 text-center">
          <div className="text-4xl mb-4">🔔</div>
          <p className="text-slate-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                notification.read 
                  ? 'bg-slate-900/30 border-slate-800' 
                  : 'bg-slate-900/50 border-blue-500/30 hover:border-blue-500/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  notification.type === 'warning' ? 'bg-orange-500/20 text-orange-400' :
                  notification.type === 'error' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {notification.type === 'warning' ? '⚠️' : notification.type === 'error' ? '❌' : 'ℹ️'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-medium ${notification.read ? 'text-slate-400' : 'text-white'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-slate-500">{formatDate(notification.created_at)}</span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
