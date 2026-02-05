import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function AssignRotas() {
  const [services, setServices] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [weeklyLead, setWeeklyLead] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ user_id: '', role: '' });

  const roles = [
    'Camera Operator',
    'Sound Engineer',
    'Lighting Tech',
    'ProPresenter Operator',
    'Livestream Director',
    'Graphics Operator',
    'Stage Manager',
    'Technical Director',
    'Video Editor'
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, membersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/services`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/team/members`, { credentials: 'include' })
      ]);
      const servicesData = await servicesRes.json();
      const membersData = await membersRes.json();
      setServices(servicesData);
      setMembers(membersData);
    } catch (err) {
      console.error(err);
    }
  };

  const addAssignment = () => {
    if (!newAssignment.user_id || !newAssignment.role) {
      toast.error('Please select a member and role');
      return;
    }
    setAssignments([...assignments, newAssignment]);
    setNewAssignment({ user_id: '', role: '' });
  };

  const removeAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const submitRota = async () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    if (!weeklyLead) {
      toast.error('Please select a weekly lead');
      return;
    }
    if (assignments.length === 0) {
      toast.error('Please add at least one assignment');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/rotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service_id: selectedService.service_id,
          assignments: assignments,
          notes: `Weekly Lead: ${members.find(m => m.user_id === weeklyLead)?.name || 'Unknown'}`
        })
      });

      if (!response.ok) throw new Error('Failed to create rota');
      
      toast.success('Rota created successfully!');
      setSelectedService(null);
      setWeeklyLead('');
      setAssignments([]);
    } catch (err) {
      toast.error('Failed to create rota');
      console.error(err);
    }
  };

  const getMemberName = (userId) => {
    return members.find(m => m.user_id === userId)?.name || 'Unknown';
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Assign Rotas</h1>
        <p className="text-slate-600 text-lg">Create service rotas and assign weekly lead</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Select Service
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {services.map((service, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedService(service)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedService?.service_id === service.service_id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <p className="font-bold">{service.title}</p>
                <p className="text-sm opacity-90">{service.date} at {service.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Assignment Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Assign Team Members
          </h2>

          {selectedService ? (
            <div className="space-y-6">
              {/* Service Info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                <p className="font-bold text-lg text-slate-800">{selectedService.title}</p>
                <p className="text-sm text-slate-600">{selectedService.date} at {selectedService.time}</p>
              </div>

              {/* Weekly Lead Selection */}
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <label className="block text-sm font-bold text-slate-800 mb-2">⭐ Weekly Lead (Responsible for Checklists)</label>
                <select
                  value={weeklyLead}
                  onChange={(e) => setWeeklyLead(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Weekly Lead...</option>
                  {members.filter(m => m.role === 'admin' || m.role === 'team_lead').map((member, idx) => (
                    <option key={idx} value={member.user_id}>{member.name} ({member.role})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-600 mt-2">The weekly lead will complete all 29 checklist items for this service</p>
              </div>

              {/* Add Assignment */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-3">Add Team Member</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Member</label>
                    <select
                      value={newAssignment.user_id}
                      onChange={(e) => setNewAssignment({ ...newAssignment, user_id: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select member...</option>
                      {members.map((member, idx) => (
                        <option key={idx} value={member.user_id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                    <select
                      value={newAssignment.role}
                      onChange={(e) => setNewAssignment({ ...newAssignment, role: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    >
                      <option value="">Select role...</option>
                      {roles.map((role, idx) => (
                        <option key={idx} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={addAssignment}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  ➕ Add Member
                </button>
              </div>

              {/* Assignments List */}
              {assignments.length > 0 && (
                <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <h3 className="font-bold text-slate-800 mb-3">Assigned Team ({assignments.length})</h3>
                  <div className="space-y-2">
                    {assignments.map((assignment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-semibold text-slate-800">{getMemberName(assignment.user_id)}</p>
                          <p className="text-sm text-slate-600">{assignment.role}</p>
                        </div>
                        <button
                          onClick={() => removeAssignment(idx)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={submitRota}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
              >
                ✅ Create Rota & Notify Team
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-6xl mb-4">👈</p>
              <p className="text-lg">Select a service to create a rota</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}