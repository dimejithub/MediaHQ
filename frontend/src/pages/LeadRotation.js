import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function LeadRotation() {
  const { demoMode, user } = useAuth();
  const [year, setYear] = useState(new Date().getFullYear());
  const [rotations, setRotations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingWeek, setEditingWeek] = useState(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'team_lead';

  const demoLeads = [
    { user_id: 'demo_admin', name: 'John Smith' },
    { user_id: 'demo_lead', name: 'Sarah Johnson' }
  ];

  useEffect(() => {
    loadData();
  }, [year, demoMode]);

  const loadData = async () => {
    setLoading(true);
    
    if (demoMode) {
      setLeads(demoLeads);
      // Generate some sample rotations
      const sampleRotations = [];
      for (let i = 1; i <= 12; i++) {
        sampleRotations.push({
          rotation_id: `demo_rot_${i}`,
          week_number: i,
          year: year,
          lead_user_id: i % 2 === 0 ? 'demo_admin' : 'demo_lead',
          lead_name: i % 2 === 0 ? 'John Smith' : 'Sarah Johnson',
          backup_user_id: i % 2 === 0 ? 'demo_lead' : 'demo_admin',
          backup_name: i % 2 === 0 ? 'Sarah Johnson' : 'John Smith'
        });
      }
      setRotations(sampleRotations);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/lead-rotation/year/${year}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setRotations(data.rotations || []);
        setLeads(data.available_leads || demoLeads);
      } else {
        setLeads(demoLeads);
        setRotations([]);
      }
    } catch (err) {
      console.error(err);
      setLeads(demoLeads);
      setRotations([]);
    } finally {
      setLoading(false);
    }
  };

  const getWeekRotation = (weekNum) => {
    return rotations.find(r => r.week_number === weekNum);
  };

  const handleAssign = async (weekNum, leadUserId, backupUserId = null) => {
    if (demoMode) {
      const lead = leads.find(l => l.user_id === leadUserId);
      const backup = leads.find(l => l.user_id === backupUserId);
      
      const existingIdx = rotations.findIndex(r => r.week_number === weekNum);
      if (existingIdx >= 0) {
        const updated = [...rotations];
        updated[existingIdx] = {
          ...updated[existingIdx],
          lead_user_id: leadUserId,
          lead_name: lead?.name || 'Unknown',
          backup_user_id: backupUserId,
          backup_name: backup?.name || null
        };
        setRotations(updated);
      } else {
        setRotations([...rotations, {
          rotation_id: `demo_rot_${Date.now()}`,
          week_number: weekNum,
          year: year,
          lead_user_id: leadUserId,
          lead_name: lead?.name || 'Unknown',
          backup_user_id: backupUserId,
          backup_name: backup?.name || null
        }]);
      }
      setEditingWeek(null);
      toast.success(`Week ${weekNum} assigned to ${lead?.name}`);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/lead-rotation/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          year: year,
          rotations: [{ week_number: weekNum, lead_user_id: leadUserId, backup_user_id: backupUserId }]
        })
      });

      if (res.ok) {
        toast.success(`Week ${weekNum} assigned`);
        loadData();
        setEditingWeek(null);
      }
    } catch (err) {
      toast.error('Failed to assign');
    }
  };

  const getWeekDateRange = (weekNum) => {
    const firstDay = new Date(year, 0, 1);
    const dayOffset = (weekNum - 1) * 7;
    const startDate = new Date(firstDay.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    
    const formatDate = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="p-8" data-testid="lead-rotation-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">52-Week Lead Rotation</h1>
          <p className="text-slate-400">Plan and assign weekly service leads for the entire year</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setYear(year - 1)} className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">←</button>
          <span className="text-2xl font-bold text-white">{year}</span>
          <button onClick={() => setYear(year + 1)} className="px-3 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">→</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-sm text-slate-400">Total Weeks</p>
          <p className="text-2xl font-bold text-white">52</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-sm text-slate-400">Assigned</p>
          <p className="text-2xl font-bold text-green-400">{rotations.length}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-sm text-slate-400">Unassigned</p>
          <p className="text-2xl font-bold text-amber-400">{52 - rotations.length}</p>
        </div>
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <p className="text-sm text-slate-400">Available Leads</p>
          <p className="text-2xl font-bold text-white">{leads.length}</p>
        </div>
      </div>

      {/* Quarters */}
      <div className="space-y-6">
        {[1, 2, 3, 4].map(quarter => (
          <div key={quarter} className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-lg font-bold text-white mb-4">Q{quarter} - Weeks {(quarter - 1) * 13 + 1} to {quarter * 13}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {weeks.slice((quarter - 1) * 13, quarter * 13).map(weekNum => {
                const rotation = getWeekRotation(weekNum);
                const isEditing = editingWeek === weekNum;
                
                return (
                  <div key={weekNum} className={`p-3 rounded-lg border transition-all ${
                    rotation ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800 border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">Week {weekNum}</span>
                      <span className="text-xs text-slate-400">{getWeekDateRange(weekNum)}</span>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-2">
                        <select
                          className="w-full p-2 text-xs bg-slate-700 border border-slate-600 rounded text-white"
                          defaultValue={rotation?.lead_user_id || ''}
                          onChange={(e) => handleAssign(weekNum, e.target.value)}
                        >
                          <option value="">Select Lead...</option>
                          {leads.map(l => (
                            <option key={l.user_id} value={l.user_id}>{l.name}</option>
                          ))}
                        </select>
                        <button onClick={() => setEditingWeek(null)} className="w-full text-xs text-slate-400 hover:text-white">Cancel</button>
                      </div>
                    ) : (
                      <>
                        {rotation ? (
                          <div>
                            <p className="text-sm text-green-400 font-medium truncate">{rotation.lead_name}</p>
                            {rotation.backup_name && (
                              <p className="text-xs text-slate-500">Backup: {rotation.backup_name}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Unassigned</p>
                        )}
                        {isAdmin && (
                          <button onClick={() => setEditingWeek(weekNum)} className="mt-2 text-xs text-slate-400 hover:text-white">
                            {rotation ? 'Edit' : 'Assign'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
