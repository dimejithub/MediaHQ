import { useEffect, useState } from 'react';
import { useAuth } from '@/App';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Real Envoy Nation Team Members
const ENVOY_MEMBERS = [
  { user_id: 'en_1', name: 'Dr. Adebowale Owoseni', email: 'adebowale@mediahq.com', role: 'director', skills: ['Leadership', 'Strategy'], unit: 'Head', team: 'envoy_nation' },
  { user_id: 'en_2', name: 'Adeola Hilton', email: 'adeola@mediahq.com', role: 'team_lead', skills: ['Leadership', 'Production'], unit: 'Lead', team: 'envoy_nation' },
  { user_id: 'en_3', name: 'Oladimeji Tiamiyu', email: 'oladimeji@mediahq.com', role: 'assistant_lead', skills: ['Leadership', 'Coordination'], unit: 'Lead', team: 'envoy_nation' },
  { user_id: 'en_4', name: 'Michel Adimula', email: 'michel@mediahq.com', role: 'unit_head', skills: ['Camera', 'Production'], unit: 'Production', team: 'envoy_nation' },
  { user_id: 'en_5', name: 'Bro Oluseye', email: 'oluseye@mediahq.com', role: 'unit_head', skills: ['ProPresenter', 'Livestream'], unit: 'Projection & Livestream', team: 'envoy_nation' },
  { user_id: 'en_6', name: 'Oladipupo Hilton', email: 'oladipupo@mediahq.com', role: 'unit_head', skills: ['Photography', 'Editing'], unit: 'Photography', team: 'envoy_nation' },
  { user_id: 'en_7', name: 'Peter Ndiparya', email: 'peter@mediahq.com', role: 'member', skills: ['ProPresenter', 'Livestream'], unit: 'Projection & Livestream', team: 'envoy_nation' },
  { user_id: 'en_8', name: 'Jemima Eromon', email: 'jemima@mediahq.com', role: 'member', skills: ['ProPresenter'], unit: 'Projection & Livestream', team: 'envoy_nation' },
  { user_id: 'en_9', name: 'Jasper Eromon', email: 'jasper@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', team: 'envoy_nation' },
  { user_id: 'en_10', name: 'Seun Morenikeji', email: 'seun@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', team: 'envoy_nation' },
  { user_id: 'en_11', name: 'Chase Hadley', email: 'chase@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', team: 'envoy_nation' },
  { user_id: 'en_12', name: 'Olukunle Ogunniran', email: 'olukunle@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', team: 'envoy_nation' },
  { user_id: 'en_13', name: 'Wade Osunmakinde', email: 'wade@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', team: 'envoy_nation' },
  { user_id: 'en_14', name: 'Bro Tobi', email: 'tobi@mediahq.com', role: 'member', skills: ['ProPresenter', 'Livestream'], unit: 'Projection & Livestream', team: 'envoy_nation' },
  { user_id: 'en_15', name: 'Onose Thompson', email: 'onose@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', team: 'envoy_nation' },
  { user_id: 'en_16', name: 'Precious Achudume', email: 'precious@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', team: 'envoy_nation' },
  { user_id: 'en_17', name: 'Oladeinde Omidiji', email: 'oladeinde@mediahq.com', role: 'member', skills: ['Photography'], unit: 'Photography', team: 'envoy_nation' },
  { user_id: 'en_18', name: 'Abiodun Durojaiye', email: 'abiodun@mediahq.com', role: 'member', skills: ['Production'], unit: 'Production', team: 'envoy_nation' },
  { user_id: 'en_19', name: 'Temidayo Peters', email: 'temidayo@mediahq.com', role: 'member', skills: ['Editing'], unit: 'Post-Production', team: 'envoy_nation' },
  { user_id: 'en_20', name: 'Favour Olusanya', email: 'favour.o@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', team: 'envoy_nation' },
  { user_id: 'en_21', name: 'Favour Anwo', email: 'favour.a@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', team: 'envoy_nation' },
  { user_id: 'en_22', name: 'Damilare Akeredolu', email: 'damilare@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', team: 'envoy_nation' },
  { user_id: 'en_23', name: 'Adeleke Matanmi', email: 'adeleke@mediahq.com', role: 'member', skills: ['Camera', 'Production'], unit: 'Production', team: 'envoy_nation' }
];

const E_NATION_MEMBERS = [
  { user_id: 'e_1', name: 'David Lee', email: 'david@mediahq.com', role: 'team_lead', skills: ['Lighting', 'Camera'], unit: 'Lead', team: 'e_nation' },
  { user_id: 'e_2', name: 'Lisa Chen', email: 'lisa@mediahq.com', role: 'assistant_lead', skills: ['Sound'], unit: 'Lead', team: 'e_nation' },
  { user_id: 'e_3', name: 'James Park', email: 'james@mediahq.com', role: 'member', skills: ['ProPresenter'], unit: 'Projection', team: 'e_nation' }
];

function getRoleLabel(role) {
  const labels = {
    director: 'Director',
    team_lead: 'Team Lead',
    assistant_lead: 'Assistant Lead',
    unit_head: 'Unit Head',
    weekly_lead: 'Weekly Lead',
    member: 'Member'
  };
  return labels[role] || 'Member';
}

function getRoleColor(role) {
  const colors = {
    director: 'bg-purple-500/20 text-purple-400',
    team_lead: 'bg-blue-500/20 text-blue-400',
    assistant_lead: 'bg-cyan-500/20 text-cyan-400',
    unit_head: 'bg-green-500/20 text-green-400',
    weekly_lead: 'bg-amber-500/20 text-amber-400',
    member: 'bg-slate-700 text-slate-300'
  };
  return colors[role] || colors.member;
}

function MemberCard({ member, onEdit, onDelete, canEdit }) {
  const [showMenu, setShowMenu] = useState(false);
  const initial = member.name ? member.name.charAt(0).toUpperCase() : '?';
  const skillsDisplay = member.skills && member.skills.length > 0 
    ? member.skills.join(', ') 
    : 'No skills listed';

  const handleEdit = () => {
    setShowMenu(false);
    onEdit(member);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete(member.user_id);
  };

  // Generate a consistent color based on name
  const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-pink-600', 'bg-amber-600', 'bg-cyan-600', 'bg-red-600', 'bg-indigo-600'];
  const colorIndex = member.name ? member.name.charCodeAt(0) % colors.length : 0;
  const avatarColor = colors[colorIndex];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
      {/* Header with gradient */}
      <div className="h-16 bg-gradient-to-r from-slate-800 to-slate-900 relative">
        {canEdit && (
          <div className="absolute top-2 right-2">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="p-1.5 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-all"
              data-testid={`member-menu-${member.user_id}`}
            >
              <svg className="w-4 h-4 text-slate-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                  <button onClick={handleEdit} className="w-full px-3 py-2 text-left text-sm text-white hover:bg-slate-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button onClick={handleDelete} className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="px-4 pb-4 -mt-8">
        {/* Avatar */}
        <div className="flex justify-center mb-3">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full border-4 border-slate-900 object-cover" />
          ) : (
            <div className={`w-16 h-16 rounded-full border-4 border-slate-900 ${avatarColor} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
              {initial}
            </div>
          )}
        </div>

        {/* Name & Role */}
        <div className="text-center mb-3">
          <h3 className="font-bold text-white text-base">{member.name}</h3>
          <p className="text-xs text-slate-400 mb-1.5">{member.email}</p>
          <span className={`inline-block px-2.5 py-0.5 text-xs rounded-full ${getRoleColor(member.role)}`}>
            {getRoleLabel(member.role)}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          {member.unit && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Unit</span>
              <span className="text-slate-300">{member.unit}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Skills</span>
            <span className="text-slate-300 text-right text-xs max-w-[60%] truncate" title={skillsDisplay}>{skillsDisplay}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddMemberModal({ member, onSave, onClose }) {
  const [name, setName] = useState(member ? member.name : '');
  const [email, setEmail] = useState(member ? member.email : '');
  const [role, setRole] = useState(member ? member.role : 'member');
  const [unit, setUnit] = useState(member ? member.unit : '');
  const [skillsText, setSkillsText] = useState(member && member.skills ? member.skills.join(', ') : '');
  const [avatar, setAvatar] = useState(member ? member.avatar : '');

  const handleSave = () => {
    const skills = skillsText.split(',').map(s => s.trim()).filter(s => s);
    onSave({ name, email, role, unit, skills, avatar });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate initial for preview
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const colors = ['bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-pink-600', 'bg-amber-600'];
  const avatarColor = colors[name ? name.charCodeAt(0) % colors.length : 0];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">{member ? 'Edit Member' : 'Add New Member'}</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Profile Picture */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-slate-800" />
              ) : (
                <div className={`w-20 h-20 rounded-full ${avatarColor} flex items-center justify-center text-white text-2xl font-bold border-4 border-slate-800`}>
                  {initial}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all shadow-lg">
                <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-slate-500 mt-2">Click camera to upload photo</p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Enter full name" />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="email@example.com" />
          </div>

          {/* Role & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none">
                <option value="director">Director</option>
                <option value="team_lead">Team Lead</option>
                <option value="assistant_lead">Assistant Lead</option>
                <option value="unit_head">Unit Head</option>
                <option value="member">Member</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none">
                <option value="">Select unit...</option>
                <option value="Head">Head</option>
                <option value="Lead">Lead</option>
                <option value="Production">Production</option>
                <option value="Photography">Photography</option>
                <option value="Projection & Livestream">Projection & Livestream</option>
                <option value="Post-Production">Post-Production</option>
              </select>
            </div>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Skills (comma separated)</label>
            <input type="text" value={skillsText} onChange={(e) => setSkillsText(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Camera, Sound, Editing" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all">Cancel</button>
          <button onClick={handleSave} className="flex-1 px-4 py-2.5 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all">
            {member ? 'Save Changes' : 'Add Member'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TeamDirectory() {
  const { demoMode, selectedTeam, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [filterUnit, setFilterUnit] = useState('all');

  const teamDisplayName = selectedTeam === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';
  const canEdit = ['director', 'admin', 'team_lead', 'assistant_lead'].includes(user?.role);
  const units = ['all', 'Head', 'Lead', 'Production', 'Photography', 'Projection & Livestream', 'Post-Production'];

  useEffect(() => {
    const demoData = selectedTeam === 'envoy_nation' ? ENVOY_MEMBERS : E_NATION_MEMBERS;
    
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

  const handleSaveMember = (memberData) => {
    if (editingMember) {
      setMembers(members.map(m => m.user_id === editingMember.user_id ? { ...m, ...memberData } : m));
      toast.success('Member updated successfully');
    } else {
      const newMember = { ...memberData, user_id: `new_${Date.now()}`, team: selectedTeam };
      setMembers([...members, newMember]);
      toast.success('Member added successfully');
    }
    setShowModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      setMembers(members.filter(m => m.user_id !== userId));
      toast.success('Member removed');
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowModal(true);
  };

  const filteredMembers = filterUnit === 'all' ? members : members.filter(m => m.unit === filterUnit);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400">Loading team...</div>
      </div>
    );
  }

  const renderFilterButtons = () => {
    return units.map(unit => {
      const isActive = filterUnit === unit;
      const className = isActive 
        ? 'px-3 py-1.5 rounded-lg text-sm bg-white text-slate-900 font-medium' 
        : 'px-3 py-1.5 rounded-lg text-sm bg-slate-800 text-slate-300 hover:bg-slate-700';
      return (
        <button key={unit} onClick={() => setFilterUnit(unit)} className={className}>
          {unit === 'all' ? 'All Units' : unit}
        </button>
      );
    });
  };

  const renderMemberCards = () => {
    return filteredMembers.map(member => (
      <MemberCard 
        key={member.user_id} 
        member={member} 
        onEdit={handleEditMember} 
        onDelete={handleDeleteMember} 
        canEdit={canEdit} 
      />
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" data-testid="team-directory">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-1">Team Directory</h1>
          <p className="text-sm sm:text-base text-slate-400">Manage {teamDisplayName} team ({members.length} members)</p>
        </div>
        {canEdit && (
          <button onClick={() => { setEditingMember(null); setShowModal(true); }}
            className="w-full sm:w-auto px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 text-sm sm:text-base">
            + Add Member
          </button>
        )}
      </div>

      <div className="mb-6">
        <p className="text-slate-400 text-sm mb-2">Filter by Unit:</p>
        <div className="flex flex-wrap gap-2">
          {renderFilterButtons()}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {renderMemberCards()}
      </div>

      {showModal && (
        <AddMemberModal 
          member={editingMember} 
          onSave={handleSaveMember} 
          onClose={() => { setShowModal(false); setEditingMember(null); }} 
        />
      )}
    </div>
  );
}
