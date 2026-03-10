import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';
import { exportToCSV } from '../lib/helpers';

export default function TeamDirectory() {
  const { profile, demoMode } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterUnit, setFilterUnit] = useState('all');

  const teamId = profile?.primary_team || 'envoy_nation'; // eslint-disable-line no-unused-vars

  useEffect(() => {
    const fetchMembers = async () => {
      if (demoMode) {
        setMembers(getDemoMembers());
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

    // Real-time subscription
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchMembers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [demoMode]);

  const units = [...new Set(members.map(m => m.unit).filter(Boolean))].sort();

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    const matchesUnit = filterUnit === 'all' || member.unit === filterUnit;
    return matchesSearch && matchesRole && matchesUnit;
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

  const getRoleLabel = (role) => {
    const labels = {
      director: 'Media Director',
      team_lead: 'Media Lead',
      assistant_lead: 'Asst. Lead',
      unit_head: 'Sub-Unit Head',
      member: 'Member',
    };
    return labels[role] || role;
  };

  const getUnitColor = (unit) => {
    const colors = {
      'Production': 'bg-orange-500/10 text-orange-400',
      'Photography': 'bg-pink-500/10 text-pink-400',
      'Projection & Livestream': 'bg-blue-500/10 text-blue-400',
      'Post-Production': 'bg-violet-500/10 text-violet-400',
      'Head': 'bg-yellow-500/10 text-yellow-400',
      'Lead': 'bg-cyan-500/10 text-cyan-400',
    };
    return colors[unit] || 'bg-slate-500/10 text-slate-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="team-directory">
      <div className="animate-fadeIn flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Team Directory</h1>
          <p className="text-slate-400 mt-1">{members.length} team members across {units.length} units</p>
        </div>
        <button
          onClick={() => exportToCSV(filteredMembers.map(m => ({ Name: m.name, Email: m.email || '', Role: m.role, Unit: m.unit || '', Skills: m.skills?.join(', ') || '', Availability: m.availability || '' })), 'team_directory')}
          className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-sm hover:bg-slate-700 transition-all"
          data-testid="export-team-csv"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="team-search"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          data-testid="team-role-filter"
          className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="director">Director</option>
          <option value="team_lead">Media Lead</option>
          <option value="assistant_lead">Asst. Lead</option>
          <option value="unit_head">Sub-Unit Head</option>
          <option value="member">Member</option>
        </select>
        <select
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
          data-testid="team-unit-filter"
          className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Units</option>
          {units.map(unit => (
            <option key={unit} value={unit}>{unit}</option>
          ))}
        </select>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-800 text-center">
          <p className="text-slate-400">No team members found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMembers.map((member, idx) => (
            <div
              key={member.user_id || member.id}
              data-testid={`member-card-${member.user_id}`}
              className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 hover:border-slate-600 transition-all card-animate animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-start gap-4">
                {member.profile_picture_url ? (
                  <img src={member.profile_picture_url} alt={member.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {member.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{member.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}>
                      {getRoleLabel(member.role)}
                    </span>
                    {member.unit && (
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getUnitColor(member.unit)}`}>
                        {member.unit}
                      </span>
                    )}
                  </div>
                  {member.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.skills.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-xs text-slate-500">{skill}{i < Math.min(member.skills.length, 3) - 1 ? ' ·' : ''}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {member.availability && member.availability !== 'available' && (
                <div className="mt-3 pt-3 border-t border-slate-800">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    member.availability === 'limited' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {member.availability === 'limited' ? 'Limited' : 'Unavailable'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDemoMembers() {
  return [
    { user_id: 'user_adebowale', name: 'Dr. Adebowale Owoseni', role: 'director', unit: 'Head', skills: ['Leadership', 'Vision'], availability: 'available' },
    { user_id: 'user_adeola', name: 'Adeola Hilton', role: 'team_lead', unit: 'Lead', skills: ['Leadership', 'Directing'], availability: 'available' },
    { user_id: 'user_oladimeji', name: 'Oladimeji Tiamiyu', role: 'assistant_lead', unit: 'Lead', skills: ['Leadership', 'Production'], availability: 'available' },
    { user_id: 'user_oladipupo', name: 'Oladipupo Hilton', role: 'unit_head', unit: 'Photography', skills: ['Photography'], availability: 'available' },
    { user_id: 'user_oluseye', name: 'Bro Oluseye', role: 'unit_head', unit: 'Projection & Livestream', skills: ['Projection'], availability: 'available' },
    { user_id: 'user_michel', name: 'Michel Adimula', role: 'unit_head', unit: 'Production', skills: ['Camera', 'Mixing'], availability: 'available' },
    { user_id: 'user_jasper', name: 'Jasper Eromon', role: 'member', unit: 'Production', skills: ['Camera', 'Mixing'], availability: 'available' },
  ];
}
