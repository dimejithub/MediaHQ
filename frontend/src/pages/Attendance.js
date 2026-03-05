import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Attendance() {
  const { profile, demoMode } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedAttendees, setSelectedAttendees] = useState([]);

  const teamId = profile?.primary_team || 'envoy_nation';

  useEffect(() => {
    fetchData();
  }, [demoMode, teamId]);

  const fetchData = async () => {
    if (demoMode) {
      setMembers([
        { user_id: 'user_1', name: 'Dr. Adebowale Owoseni' },
        { user_id: 'user_2', name: 'Adeola Hilton' },
        { user_id: 'user_3', name: 'Oladimeji Tiamiyu' },
        { user_id: 'user_4', name: 'Michel Adimula' },
        { user_id: 'user_5', name: 'Bro Oluseye' },
        { user_id: 'user_6', name: 'Gabriel Mensah' },
        { user_id: 'user_7', name: 'Jasper Okonkwo' },
      ]);
      setAttendance([
        { id: '1', date: '2026-03-04', team_id: 'envoy_nation', attendees: ['user_1', 'user_2', 'user_3', 'user_4'] },
        { id: '2', date: '2026-02-25', team_id: 'envoy_nation', attendees: ['user_1', 'user_3', 'user_5', 'user_6'] },
        { id: '3', date: '2026-02-18', team_id: 'envoy_nation', attendees: ['user_2', 'user_4', 'user_7'] },
      ]);
      setLoading(false);
      return;
    }

    try {
      const [attendanceRes, membersRes] = await Promise.all([
        supabase.from('attendance').select('*').order('date', { ascending: false }),
        supabase.from('profiles').select('id, user_id, name')
      ]);

      setAttendance(attendanceRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async () => {
    if (demoMode) {
      const existing = attendance.find(a => a.date === selectedDate);
      if (existing) {
        setAttendance(attendance.map(a => 
          a.date === selectedDate ? { ...a, attendees: selectedAttendees } : a
        ));
      } else {
        setAttendance([
          { id: Date.now().toString(), date: selectedDate, team_id: teamId, attendees: selectedAttendees },
          ...attendance
        ]);
      }
      setShowMarkModal(false);
      setSelectedAttendees([]);
      return;
    }

    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          date: selectedDate,
          team_id: teamId,
          attendees: selectedAttendees
        }, { onConflict: 'date,team_id' });

      if (error) throw error;
      fetchData();
      setShowMarkModal(false);
      setSelectedAttendees([]);
    } catch (err) {
      console.error('Error marking attendance:', err);
      alert('Failed to save attendance');
    }
  };

  const toggleAttendee = (userId) => {
    setSelectedAttendees(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const openMarkModal = (date = null) => {
    const dateToUse = date || new Date().toISOString().split('T')[0];
    setSelectedDate(dateToUse);
    
    const existing = attendance.find(a => a.date === dateToUse);
    setSelectedAttendees(existing?.attendees || []);
    setShowMarkModal(true);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getMemberStats = () => {
    const stats = {};
    members.forEach(m => {
      const userId = m.user_id || m.id;
      stats[userId] = {
        name: m.name,
        attended: 0,
        total: attendance.length
      };
    });
    
    attendance.forEach(a => {
      (a.attendees || []).forEach(userId => {
        if (stats[userId]) {
          stats[userId].attended++;
        }
      });
    });
    
    return Object.entries(stats).map(([userId, data]) => ({
      userId,
      ...data,
      rate: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0
    })).sort((a, b) => b.rate - a.rate);
  };

  const memberStats = getMemberStats();
  const flaggedMembers = memberStats.filter(m => m.rate < 50 && m.total > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 mt-1">Tuesday Standup Meetings</p>
        </div>
        <button
          onClick={() => openMarkModal()}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          + Mark Attendance
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Total Members</p>
          <p className="text-2xl font-bold text-white mt-1">{members.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Meetings Recorded</p>
          <p className="text-2xl font-bold text-white mt-1">{attendance.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Last Meeting</p>
          <p className="text-2xl font-bold text-white mt-1">
            {attendance[0]?.attendees?.length || 0}/{members.length}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Flagged</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">{flaggedMembers.length}</p>
        </div>
      </div>

      {/* Flagged Members Alert */}
      {flaggedMembers.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
          <h3 className="text-orange-400 font-medium mb-2">⚠️ Attendance Alert</h3>
          <p className="text-slate-300 text-sm">
            {flaggedMembers.length} member(s) with attendance below 50%: {' '}
            {flaggedMembers.map(m => m.name).join(', ')}
          </p>
        </div>
      )}

      {/* Recent Attendance Records */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Recent Records</h2>
        </div>
        {attendance.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-400">No attendance records yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {attendance.slice(0, 5).map((record) => (
              <div 
                key={record.id} 
                className="p-4 flex items-center justify-between hover:bg-slate-800/50 cursor-pointer"
                onClick={() => openMarkModal(record.date)}
              >
                <div>
                  <p className="text-white font-medium">{formatDate(record.date)}</p>
                  <p className="text-slate-400 text-sm">
                    {record.attendees?.length || 0} of {members.length} present
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${members.length > 0 ? ((record.attendees?.length || 0) / members.length) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-1">
                    {members.length > 0 ? Math.round(((record.attendees?.length || 0) / members.length) * 100) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Attendance Overview */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <h2 className="text-lg font-semibold text-white">Member Overview</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {memberStats.map((member) => (
            <div key={member.userId} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {member.name?.charAt(0) || '?'}
                </div>
                <span className="text-white">{member.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">{member.attended}/{member.total}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.rate >= 75 ? 'bg-green-500/20 text-green-400' :
                  member.rate >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {member.rate}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-800 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-2">Mark Attendance</h2>
            <p className="text-slate-400 text-sm mb-6">{formatDate(selectedDate)}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div className="space-y-2 mb-6">
              <p className="text-sm text-slate-400 mb-2">Select attendees ({selectedAttendees.length} selected)</p>
              {members.map((member) => {
                const userId = member.user_id || member.id;
                return (
                  <button
                    key={userId}
                    onClick={() => toggleAttendee(userId)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      selectedAttendees.includes(userId)
                        ? 'bg-blue-500/20 border border-blue-500/30'
                        : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedAttendees.includes(userId)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-slate-500'
                    }`}>
                      {selectedAttendees.includes(userId) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="text-white">{member.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMarkModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium"
              >
                Save Attendance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
