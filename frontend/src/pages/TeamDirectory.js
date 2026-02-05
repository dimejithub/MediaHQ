import { useEffect, useState } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Real Envoy Nation Team Members
const DEMO_MEMBERS = {
  envoy_nation: [
    { user_id: 'en_1', name: 'Dr. Adebowale Owoseni', email: 'adebowale@mediahq.com', role: 'director', skills: ['Leadership', 'Strategy'], unit: 'Head', function: 'Lead', availability: 'Available', team: 'envoy_nation' },
    { user_id: 'en_2', name: 'Adeola Hilton', email: 'adeola@mediahq.com', role: 'team_lead', skills: ['Leadership', 'Production'], unit: 'Lead', function: 'Lead', team: 'envoy_nation' },
    { user_id: 'en_3', name: 'Oladimeji Tiamiyu', email: 'oladimeji@mediahq.com', role: 'assistant_lead', skills: ['Leadership', 'Coordination'], unit: 'Lead', function: 'Lead', team: 'envoy_nation' },
    { user_id: 'en_4', name: 'Michel Adimula', email: 'michel@mediahq.com', role: 'unit_head', skills: ['Camera', 'Production'], unit: 'Production', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_5', name: 'Bro Oluseye', email: 'oluseye@mediahq.com', role: 'unit_head', skills: ['ProPresenter', 'Livestream'], unit: 'Projection & Livestream', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_6', name: 'Oladipupo Hilton', email: 'oladipupo@mediahq.com', role: 'unit_head', skills: ['Photography', 'Editing'], unit: 'Photography', function: 'Photographer', team: 'envoy_nation' },
    { user_id: 'en_7', name: 'Peter Ndiparya', email: 'peter@mediahq.com', role: 'member', skills: ['ProPresenter', 'Livestream'], unit: 'Projection & Livestream', function: 'Support', team: 'envoy_nation' },
    { user_id: 'en_8', name: 'Jemima Eromon', email: 'jemima@mediahq.com', role: 'member', skills: ['ProPresenter'], unit: 'Projection & Livestream', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_9', name: 'Jasper Eromon', email: 'jasper@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_10', name: 'Seun Morenikeji', email: 'seun@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', function: 'Photographer', team: 'envoy_nation' },
    { user_id: 'en_11', name: 'Chase Hadley', email: 'chase@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', function: 'Photographer', team: 'envoy_nation' },
    { user_id: 'en_12', name: 'Olukunle Ogunniran', email: 'olukunle@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_13', name: 'Wade Osunmakinde', email: 'wade@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_14', name: 'Bro Tobi', email: 'tobi@mediahq.com', role: 'member', skills: ['ProPresenter', 'Livestream'], unit: 'Projection & Livestream', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_15', name: 'Onose Thompson', email: 'onose@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', function: 'Photographer', team: 'envoy_nation' },
    { user_id: 'en_16', name: 'Precious Achudume', email: 'precious@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', function: 'Support', team: 'envoy_nation' },
    { user_id: 'en_17', name: 'Oladeinde Omidiji', email: 'oladeinde@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_18', name: 'Abiodun Durojaiye', email: 'abiodun@mediahq.com', role: 'member', skills: ['Production'], unit: 'Production', function: 'Support', team: 'envoy_nation' },
    { user_id: 'en_19', name: 'Temidayo Peters', email: 'temidayo@mediahq.com', role: 'member', skills: ['Editing', 'Post-Production'], unit: 'Post-Production', function: 'Editor', team: 'envoy_nation' },
    { user_id: 'en_20', name: 'Favour Olusanya', email: 'favour.o@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_21', name: 'Favour Anwo', email: 'favour.a@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_22', name: 'Damilare Akeredolu', email: 'damilare@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', function: 'Operator', team: 'envoy_nation' },
    { user_id: 'en_23', name: 'Adeleke Matanmi', email: 'adeleke@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', function: 'Operator', team: 'envoy_nation' }
  ],
  e_nation: [
    { user_id: 'e_1', name: 'David Lee', email: 'david@mediahq.com', role: 'team_lead', skills: ['Lighting', 'Camera'], unit: 'Lead', team: 'e_nation' },
    { user_id: 'e_2', name: 'Lisa Chen', email: 'lisa@mediahq.com', role: 'assistant_lead', skills: ['Sound'], unit: 'Lead', team: 'e_nation' },
    { user_id: 'e_3', name: 'James Park', email: 'james@mediahq.com', role: 'member', skills: ['ProPresenter'], unit: 'Projection', team: 'e_nation' }
  ]
};

const ROLE_LABELS = {
  director: { label: 'Director', color: 'bg-purple-500/20 text-purple-400' },
  team_lead: { label: 'Team Lead', color: 'bg-blue-500/20 text-blue-400' },
  assistant_lead: { label: 'Assistant Lead', color: 'bg-cyan-500/20 text-cyan-400' },
  unit_head: { label: 'Unit Head', color: 'bg-green-500/20 text-green-400' },
  weekly_lead: { label: 'Weekly Lead', color: 'bg-amber-500/20 text-amber-400' },
  member: { label: 'Member', color: 'bg-slate-700 text-slate-300' }
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
