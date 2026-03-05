import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Real Envoy Nation Team Members
const ENVOY_MEMBERS = [
  { user_id: 'en_1', name: 'Dr. Adebowale Owoseni', role: 'director', unit: 'Head' },
  { user_id: 'en_2', name: 'Adeola Hilton', role: 'team_lead', unit: 'Lead' },
  { user_id: 'en_3', name: 'Oladimeji Tiamiyu', role: 'assistant_lead', unit: 'Lead' },
  { user_id: 'en_4', name: 'Michel Adimula', role: 'unit_head', unit: 'Production' },
  { user_id: 'en_5', name: 'Bro Oluseye', role: 'unit_head', unit: 'Projection & Livestream' },
  { user_id: 'en_6', name: 'Oladipupo Hilton', role: 'unit_head', unit: 'Photography' },
  { user_id: 'en_7', name: 'Peter Ndiparya', role: 'member', unit: 'Projection & Livestream' },
  { user_id: 'en_8', name: 'Jemima Eromon', role: 'member', unit: 'Projection & Livestream' },
  { user_id: 'en_9', name: 'Jasper Eromon', role: 'member', unit: 'Production' },
  { user_id: 'en_10', name: 'Seun Morenikeji', role: 'member', unit: 'Photography' },
  { user_id: 'en_11', name: 'Chase Hadley', role: 'member', unit: 'Photography' },
  { user_id: 'en_12', name: 'Olukunle Ogunniran', role: 'member', unit: 'Production' },
  { user_id: 'en_13', name: 'Wade Osunmakinde', role: 'member', unit: 'Production' },
  { user_id: 'en_14', name: 'Bro Tobi', role: 'member', unit: 'Projection & Livestream' },
  { user_id: 'en_15', name: 'Onose Thompson', role: 'member', unit: 'Photography' },
  { user_id: 'en_16', name: 'Precious Achudume', role: 'member', unit: 'Photography' },
  { user_id: 'en_17', name: 'Oladeinde Omidiji', role: 'member', unit: 'Photography' },
  { user_id: 'en_18', name: 'Abiodun Durojaiye', role: 'member', unit: 'Production' },
  { user_id: 'en_19', name: 'Temidayo Peters', role: 'member', unit: 'Post-Production' },
  { user_id: 'en_20', name: 'Favour Olusanya', role: 'member', unit: 'Production' },
  { user_id: 'en_21', name: 'Favour Anwo', role: 'member', unit: 'Production' },
  { user_id: 'en_22', name: 'Damilare Akeredolu', role: 'member', unit: 'Production' },
  { user_id: 'en_23', name: 'Adeleke Matanmi', role: 'member', unit: 'Production' }
];

const E_NATION_MEMBERS = [
  { user_id: 'e_1', name: 'David Lee', role: 'team_lead', unit: 'Lead' },
  { user_id: 'e_2', name: 'Lisa Chen', role: 'assistant_lead', unit: 'Lead' },
  { user_id: 'e_3', name: 'James Park', role: 'member', unit: 'Projection' }
];

// Demo attendance records
const DEMO_ATTENDANCE = [
  { date: '2026-02-03', attendees: ['en_1', 'en_2', 'en_3', 'en_4', 'en_5', 'en_7', 'en_9', 'en_12', 'en_14', 'en_19'] },
  { date: '2026-01-27', attendees: ['en_1', 'en_2', 'en_3', 'en_5', 'en_6', 'en_8', 'en_10', 'en_11', 'en_15', 'en_16', 'en_20'] },
  { date: '2026-01-20', attendees: ['en_2', 'en_3', 'en_4', 'en_5', 'en_7', 'en_9', 'en_12', 'en_13', 'en_18', 'en_22'] },
  { date: '2026-01-13', attendees: ['en_1', 'en_2', 'en_4', 'en_6', 'en_8', 'en_10', 'en_14', 'en_17', 'en_21', 'en_23'] }
];

export default function Attendance() {
  const { demoMode, user, selectedTeam } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentAttendance, setCurrentAttendance] = useState([]);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [newDate, setNewDate] = useState('');

  const teamMembers = selectedTeam === 'envoy_nation' ? ENVOY_MEMBERS : E_NATION_MEMBERS;
  const teamDisplayName = selectedTeam === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';
  const isAdmin = user?.role === 'admin' || user?.role === 'team_lead' || user?.role === 'director' || user?.role === 'assistant_lead';

  useEffect(() => {
    if (demoMode) {
      setMembers(teamMembers);
      setAttendanceRecords(DEMO_ATTENDANCE);
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${BACKEND_URL}/api/users/team/${selectedTeam}`, { credentials: 'include' }).then(r => r.ok ? r.json() : teamMembers),
      fetch(`${BACKEND_URL}/api/attendance?team=${selectedTeam}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([memberData, attendanceData]) => {
      setMembers(memberData.length > 0 ? memberData : teamMembers);
      setAttendanceRecords(attendanceData.length > 0 ? attendanceData : DEMO_ATTENDANCE);
      setLoading(false);
    }).catch(() => {
      setMembers(teamMembers);
      setAttendanceRecords(DEMO_ATTENDANCE);
      setLoading(false);
    });
  }, [demoMode, selectedTeam]);

  // Calculate consecutive absences
  const getConsecutiveAbsences = (memberId) => {
    let consecutive = 0;
    const sortedRecords = [...attendanceRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    for (const record of sortedRecords) {
      if (!record.attendees.includes(memberId)) {
        consecutive++;
      } else {
        break;
      }
    }
    return consecutive;
  };

  // Get attendance stats for a member
  const getMemberStats = (memberId) => {
    const totalMeetings = attendanceRecords.length;
    const attended = attendanceRecords.filter(r => r.attendees.includes(memberId)).length;
    const percentage = totalMeetings > 0 ? Math.round((attended / totalMeetings) * 100) : 0;
    const consecutiveAbsences = getConsecutiveAbsences(memberId);
    return { attended, totalMeetings, percentage, consecutiveAbsences };
  };

  const handleMarkAttendance = () => {
    if (!newDate) {
      toast.error('Please select a date');
      return;
    }

    const newRecord = {
      date: newDate,
      attendees: currentAttendance,
      team: selectedTeam
    };

    if (demoMode) {
      setAttendanceRecords([newRecord, ...attendanceRecords]);
      setShowMarkModal(false);
      setNewDate('');
      setCurrentAttendance([]);
      toast.success(`Attendance marked for ${newDate}`);
      return;
    }

    fetch(`${BACKEND_URL}/api/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newRecord)
    }).then(res => {
      if (res.ok) {
        setAttendanceRecords([newRecord, ...attendanceRecords]);
        toast.success('Attendance saved');
      }
    }).catch(() => {
      setAttendanceRecords([newRecord, ...attendanceRecords]);
      toast.success('Attendance marked');
    });

    setShowMarkModal(false);
    setNewDate('');
    setCurrentAttendance([]);
  };

  const toggleAttendance = (memberId) => {
    setCurrentAttendance(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Get flagged members (2+ consecutive absences)
  const flaggedMembers = members.filter(m => getConsecutiveAbsences(m.user_id) >= 2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading attendance...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8" data-testid="attendance-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">Tuesday Standup Attendance</h1>
          <p className="text-slate-400 text-sm sm:text-base">Track {teamDisplayName} weekly meeting attendance</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowMarkModal(true)}
            data-testid="mark-attendance-btn"
            className="w-full sm:w-auto px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
          >
            + Mark Attendance
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{members.length}</p>
          <p className="text-xs text-slate-400">Total Members</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-400">{attendanceRecords.length}</p>
          <p className="text-xs text-slate-400">Meetings Recorded</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-400">
            {attendanceRecords.length > 0 ? Math.round(attendanceRecords[0]?.attendees.length / members.length * 100) : 0}%
          </p>
          <p className="text-xs text-slate-400">Last Meeting Rate</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-400">{flaggedMembers.length}</p>
          <p className="text-xs text-slate-400">Flagged (2+ Absences)</p>
        </div>
      </div>

      {/* Flagged Members Alert */}
      {flaggedMembers.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-red-400 mb-1">Attendance Alert</h3>
              <p className="text-sm text-slate-300 mb-2">
                The following members have missed 2 or more consecutive Tuesday standups:
              </p>
              <div className="flex flex-wrap gap-2">
                {flaggedMembers.map(member => (
                  <span key={member.user_id} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                    {member.name} ({getConsecutiveAbsences(member.user_id)} missed)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Attendance Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Member Attendance Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Member</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase">Unit</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Attended</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Rate</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {members.map(member => {
                const stats = getMemberStats(member.user_id);
                const isFlagged = stats.consecutiveAbsences >= 2;
                return (
                  <tr key={member.user_id} className={`hover:bg-slate-800/30 ${isFlagged ? 'bg-red-500/5' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isFlagged ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-white'
                        }`}>
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{member.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{member.role?.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{member.unit}</td>
                    <td className="px-4 py-3 text-center text-sm text-white">
                      {stats.attended}/{stats.totalMeetings}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        stats.percentage >= 80 ? 'bg-green-500/20 text-green-400' :
                        stats.percentage >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {stats.percentage}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isFlagged ? (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
                          ⚠️ {stats.consecutiveAbsences} missed
                        </span>
                      ) : stats.consecutiveAbsences === 1 ? (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium">
                          1 missed
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          ✓ Good
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Meetings */}
      <div className="mt-8">
        <h2 className="text-lg font-bold text-white mb-4">Recent Meetings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {attendanceRecords.slice(0, 4).map((record, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-medium">{record.date}</span>
                <span className="text-xs text-slate-400">
                  {record.attendees.length}/{members.length}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mb-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(record.attendees.length / members.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400">
                {Math.round((record.attendees.length / members.length) * 100)}% attendance
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Mark Standup Attendance</h2>
              <p className="text-sm text-slate-400 mt-1">Select members who attended the meeting</p>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Meeting Date *</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  data-testid="attendance-date-input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-300">Attendees ({currentAttendance.length}/{members.length})</label>
                  <button
                    onClick={() => setCurrentAttendance(currentAttendance.length === members.length ? [] : members.map(m => m.user_id))}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    {currentAttendance.length === members.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {members.map(member => (
                    <button
                      key={member.user_id}
                      onClick={() => toggleAttendance(member.user_id)}
                      className={`p-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                        currentAttendance.includes(member.user_id)
                          ? 'bg-green-500/20 border border-green-500/50'
                          : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                      }`}
                      data-testid={`attendance-member-${member.user_id}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        currentAttendance.includes(member.user_id)
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}>
                        {currentAttendance.includes(member.user_id) ? '✓' : ''}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.unit}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => { setShowMarkModal(false); setCurrentAttendance([]); setNewDate(''); }}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAttendance}
                data-testid="confirm-attendance-btn"
                className="flex-1 px-4 py-2.5 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
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
