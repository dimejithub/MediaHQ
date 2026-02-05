import { useEffect, useState } from 'react';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function TeamDirectory() {
  const { demoMode } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoMembers = [
    { user_id: 'demo_admin', name: 'John Smith', email: 'john@mediahq.com', role: 'admin', skills: ['Camera', 'Sound', 'Lighting'], availability: 'available' },
    { user_id: 'demo_lead', name: 'Sarah Johnson', email: 'sarah@mediahq.com', role: 'team_lead', skills: ['ProPresenter', 'Livestream', 'Graphics'], availability: 'available' },
    { user_id: 'demo_member1', name: 'Mike Wilson', email: 'mike@mediahq.com', role: 'member', skills: ['Camera', 'Video Editing'], availability: 'available' },
    { user_id: 'demo_member2', name: 'Emily Brown', email: 'emily@mediahq.com', role: 'member', skills: ['Sound', 'Lighting'], availability: 'busy' },
    { user_id: 'demo_member3', name: 'David Lee', email: 'david@mediahq.com', role: 'member', skills: ['Graphics', 'Stage Management'], availability: 'available' }
  ];

  useEffect(() => {
    if (demoMode) {
      setMembers(demoMembers);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/team/members`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setMembers(data.length > 0 ? data : demoMembers);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMembers(demoMembers);
        setLoading(false);
      });
  }, [demoMode]);

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
      <p className="text-slate-400 mb-8">Manage your media team members</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.user_id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all" data-testid={`member-${member.user_id}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold text-white">
                {member.name?.charAt(0) || '?'}
              </div>
              <div>
                <h3 className="font-bold text-white">{member.name}</h3>
                <p className="text-sm text-slate-400">{member.email}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full capitalize ${
                  member.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                  member.role === 'team_lead' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-700 text-slate-300'
                }`}>{member.role?.replace('_', ' ')}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {member.skills && member.skills.length > 0 ? (
                  member.skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">{skill}</span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No skills listed</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}