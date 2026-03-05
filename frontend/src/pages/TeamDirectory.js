import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function TeamDirectory() {
  const { profile, demoMode } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const teamId = profile?.primary_team || 'envoy_nation';

  useEffect(() => {
    const fetchMembers = async () => {
      if (demoMode) {
        setMembers([
          { user_id: '1', name: 'Dr. Adebowale Owoseni', email: 'adebowale@tenmediahq.com', role: 'director', unit: 'Leadership', primary_team: 'envoy_nation' },
          { user_id: '2', name: 'Adeola Hilton', email: 'adeola@tenmediahq.com', role: 'team_lead', unit: 'Production', primary_team: 'envoy_nation' },
          { user_id: '3', name: 'Oladimeji Tiamiyu', email: 'oladimeji@tenmediahq.com', role: 'assistant_lead', unit: 'Technical', primary_team: 'envoy_nation' },
          { user_id: '4', name: 'Michel Adimula', email: 'michel@tenmediahq.com', role: 'unit_head', unit: 'Sound', primary_team: 'envoy_nation' },
          { user_id: '5', name: 'Bro Oluseye', email: 'oluseye@tenmediahq.com', role: 'unit_head', unit: 'Visuals', primary_team: 'envoy_nation' },
          { user_id: '6', name: 'Gabriel Mensah', email: 'gabriel@tenmediahq.com', role: 'member', unit: 'Camera', primary_team: 'envoy_nation' },
          { user_id: '7', name: 'Jasper Okonkwo', email: 'jasper@tenmediahq.com', role: 'member', unit: 'Sound', primary_team: 'envoy_nation' },
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
        console.error('Error fetching members:', err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [demoMode]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    const colors = {
      director: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      team_lead: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      assistant_lead: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      unit_head: 'bg-green-500/20 text-green-400 border-green-500/30',
      member: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    };
    return colors[role] || colors.member;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Team Directory</h1>
        <p className="text-slate-400 mt-1">{members.length} team members</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="director">Director</option>
          <option value="team_lead">Team Lead</option>
          <option value="assistant_lead">Assistant Lead</option>
          <option value="unit_head">Unit Head</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-800 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-slate-400">No team members found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member) => (
            <div
              key={member.user_id || member.id}
              className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {member.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{member.name}</h3>
                  <p className="text-slate-400 text-sm truncate">{member.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}>
                      {member.role?.replace('_', ' ')}
                    </span>
                    {member.unit && (
                      <span className="text-slate-500 text-xs">{member.unit}</span>
                    )}
                  </div>
                </div>
              </div>
              {member.phone && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <p className="text-slate-400 text-sm">📞 {member.phone}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
