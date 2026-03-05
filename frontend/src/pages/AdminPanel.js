import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const { profile, demoMode } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = ['director', 'team_lead', 'assistant_lead'].includes(profile?.role);

  useEffect(() => {
    fetchMembers();
  }, [demoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMembers = async () => {
    if (demoMode) {
      setMembers([
        { id: '1', user_id: 'user_1', name: 'Dr. Adebowale Owoseni', role: 'director', unit: 'Head', email: 'adebowale@test.com' },
        { id: '2', user_id: 'user_2', name: 'Adeola Hilton', role: 'team_lead', unit: 'Lead', email: 'adeola@test.com' },
        { id: '3', user_id: 'user_3', name: 'Jasper Eromon', role: 'member', unit: 'Production', email: 'jasper@test.com' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('name');
      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    if (demoMode) {
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      setMessage({ type: 'success', text: 'Role updated (demo)' });
      return;
    }

    setSaving(memberId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);
      if (error) throw error;
      setMembers(members.map(m => m.id === memberId ? { ...m, role: newRole } : m));
      setMessage({ type: 'success', text: 'Role updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update role' });
    } finally {
      setSaving(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleUnitChange = async (memberId, newUnit) => {
    if (demoMode) {
      setMembers(members.map(m => m.id === memberId ? { ...m, unit: newUnit } : m));
      return;
    }

    setSaving(memberId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ unit: newUnit })
        .eq('id', memberId);
      if (error) throw error;
      setMembers(members.map(m => m.id === memberId ? { ...m, unit: newUnit } : m));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setSaving(null);
    }
  };

  if (!isAdmin && !demoMode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-2xl text-slate-400 mb-2">Access Restricted</p>
          <p className="text-slate-500">Only directors and leads can manage team roles.</p>
        </div>
      </div>
    );
  }

  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-panel">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Panel</h1>
        <p className="text-slate-400 mt-1">Manage team roles, units, and permissions</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success'
            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {['director', 'team_lead', 'assistant_lead', 'unit_head', 'member'].map(role => (
          <div key={role} className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 text-center">
            <div className="text-2xl font-bold text-white">{members.filter(m => m.role === role).length}</div>
            <div className="text-xs text-slate-400 capitalize mt-1">{role.replace(/_/g, ' ')}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search members..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        data-testid="admin-search"
        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
      />

      {/* Members Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Name</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Role</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Unit</th>
                <th className="text-left p-4 text-slate-400 text-sm font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map(member => (
                <tr key={member.id || member.user_id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {member.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{member.name}</p>
                        <p className="text-slate-500 text-xs">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <select
                      value={member.role || 'member'}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      disabled={saving === member.id}
                      data-testid={`role-select-${member.user_id}`}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="director">Director</option>
                      <option value="team_lead">Media Lead</option>
                      <option value="assistant_lead">Asst. Lead</option>
                      <option value="unit_head">Sub-Unit Head</option>
                      <option value="member">Member</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={member.unit || ''}
                      onChange={(e) => handleUnitChange(member.id, e.target.value)}
                      disabled={saving === member.id}
                      data-testid={`unit-select-${member.user_id}`}
                      className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    >
                      <option value="">No Unit</option>
                      <option value="Head">Head</option>
                      <option value="Lead">Lead</option>
                      <option value="Production">Production</option>
                      <option value="Photography">Photography</option>
                      <option value="Projection & Livestream">Projection & Livestream</option>
                      <option value="Post-Production">Post-Production</option>
                    </select>
                  </td>
                  <td className="p-4">
                    {saving === member.id ? (
                      <span className="text-blue-400 text-xs animate-pulse">Saving...</span>
                    ) : (
                      <span className="text-green-400 text-xs">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
