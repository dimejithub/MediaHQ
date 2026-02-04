import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function TeamDirectory() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/team/members`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(err => console.error(err));
  }, []);

  const renderSkills = (skills) => {
    if (!skills || skills.length === 0) {
      return <span className="text-xs text-gray-500">No skills listed</span>;
    }
    return skills.map((skill, idx) => (
      <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded">{skill}</span>
    ));
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Team Directory</h1>
      <p className="text-gray-600 mb-8">Manage your media team members</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {members.map((member, idx) => (
          <div key={idx} className="bg-white border rounded-lg p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                {member.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.email}</p>
                <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{member.role}</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {renderSkills(member.skills)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}