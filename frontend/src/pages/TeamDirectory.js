import { useEffect, useState } from 'react';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DEMO_MEMBERS = {
  envoy_nation: [
    { user_id: 'demo_en_admin', name: 'John Smith', email: 'john@mediahq.com', role: 'admin', skills: ['Camera', 'Sound'], availability: 'available', team: 'envoy_nation' },
    { user_id: 'demo_en_lead', name: 'Sarah Johnson', email: 'sarah@mediahq.com', role: 'team_lead', skills: ['ProPresenter'], availability: 'available', team: 'envoy_nation' },
    { user_id: 'demo_en_member1', name: 'Mike Wilson', email: 'mike@mediahq.com', role: 'member', skills: ['Camera'], availability: 'available', team: 'envoy_nation' },
    { user_id: 'demo_en_member2', name: 'Emily Brown', email: 'emily@mediahq.com', role: 'member', skills: ['Sound'], availability: 'busy', team: 'envoy_nation' }
  ],
  e_nation: [
    { user_id: 'demo_e_admin', name: 'David Lee', email: 'david@mediahq.com', role: 'admin', skills: ['Lighting', 'Camera'], availability: 'available', team: 'e_nation' },
    { user_id: 'demo_e_lead', name: 'Lisa Chen', email: 'lisa@mediahq.com', role: 'team_lead', skills: ['Sound'], availability: 'available', team: 'e_nation' },
    { user_id: 'demo_e_member1', name: 'James Park', email: 'james@mediahq.com', role: 'member', skills: ['ProPresenter'], availability: 'available', team: 'e_nation' }
  ]
};

function SkillBadge({ skill }) {
  return <span className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">{skill}</span>;
}

function SkillsList({ skills }) {
  if (!skills || skills.length === 0) {
    return <span className="text-xs text-slate-500">No skills listed</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => <SkillBadge key={idx} skill={skill} />)}
    </div>
  );
}

function MemberCard({ member }) {
  const getRoleClass = (role) => {
    if (role === 'admin') return 'bg-purple-500/20 text-purple-400';
    if (role === 'team_lead') return 'bg-blue-500/20 text-blue-400';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white">
          {member.name?.charAt(0) || '?'}
        </div>
        <div>
          <h3 className="font-bold text-white">{member.name}</h3>
          <p className="text-sm text-slate-400">{member.email}</p>
          <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full capitalize ${getRoleClass(member.role)}`}>
            {member.role?.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-medium text-slate-400 mb-2">Skills</h4>
        <SkillsList skills={member.skills} />
      </div>
    </div>
  );
}

function MembersList({ members }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => <MemberCard key={member.user_id} member={member} />)}
    </div>
  );
}

export default function TeamDirectory() {
  const { demoMode, selectedTeam } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const teamDisplayName = selectedTeam === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';

  useEffect(() => {
    const demoData = DEMO_MEMBERS[selectedTeam] || DEMO_MEMBERS.envoy_nation;
    
    if (demoMode) {
      setMembers(demoData);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/team/members?team=${selectedTeam}`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : demoData)
      .then(data => {
        setMembers(data.length > 0 ? data : demoData);
        setLoading(false);
      })
      .catch(() => {
        setMembers(demoData);
        setLoading(false);
      });
  }, [demoMode, selectedTeam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="team-directory">
      <h1 className="text-4xl font-bold text-white mb-2">Team Directory</h1>
      <p className="text-slate-400 mb-8">Manage {teamDisplayName} team members</p>
      <MembersList members={members} />
    </div>
  );
}
