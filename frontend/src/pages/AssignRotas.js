import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// The 29 checklist items that auto-populate when a lead is assigned
const CHECKLIST_ITEMS = [
  'Ensure all team members are present',
  'Check the rota to ensure all unit members officiating are present',
  'Assign specific roles and responsibilities',
  'Turn on all sockets, media appliances, screens including LED screen',
  'Inspect that all equipment are properly connected',
  'Verify cameras, switchers, and monitors',
  'Confirm HDMI cables are working',
  'Check battery levels and replace if needed',
  'Ensure proper camera angles and framing',
  'Confirm pulpit camera is properly placed',
  'Test camera switching and transitions',
  'Check communication headsets for clear audio',
  'Ensure livestream feed audio is clear',
  'Set up laptop/system for projection and livestream',
  'Download images/videos/lyrics from WhatsApp or Drive',
  'Verify slides, lyrics, and video cues',
  'Run short cue test for smooth transitions',
  'Start streaming 5 mins before service start time',
  'Confirm overlays/lower-thirds are working',
  'Ensure smooth camera switching and transitions',
  'Monitor video quality and adjust as needed',
  'Stay in sync with presentation and sound teams',
  'Be ready to troubleshoot issues quickly',
  'Document conflicts/challenges faced during service',
  'Discuss what went well and issues faced',
  'Note any equipment needing maintenance',
  'Plan improvements for the next service',
  'Turn off all equipment properly',
  'Complete service report form'
];

export default function AssignRotas() {
  const { demoMode, selectedTeam } = useAuth();
  const [services, setServices] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [weeklyLead, setWeeklyLead] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ user_id: '', role: '' });
  const [loading, setLoading] = useState(true);

  const teamDisplayName = selectedTeam === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';

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

  // Demo data by team
  const demoServices = {
    envoy_nation: [
      { service_id: 'demo_en_1', title: 'Sunday Service', date: '2026-02-08', time: '11:00', type: 'sunday_service' },
      { service_id: 'demo_en_2', title: 'Leicester Blessings', date: '2026-02-12', time: '19:00', type: 'leicester_blessings' },
      { service_id: 'demo_en_3', title: 'Connected with PMO', date: '2026-02-26', time: '19:00', type: 'connected_pmo' }
    ],
    e_nation: [
      { service_id: 'demo_e_1', title: 'The Commissioned Envoy', date: '2026-02-08', time: '14:00', type: 'sunday_service' },
      { service_id: 'demo_e_2', title: 'Midweek Service', date: '2026-02-11', time: '19:00', type: 'midweek_service' }
    ]
  };

  // Real team members
  const demoMembers = {
    envoy_nation: [
      { user_id: 'en_1', name: 'Dr. Adebowale Owoseni', role: 'director' },
      { user_id: 'en_2', name: 'Adeola Hilton', role: 'team_lead' },
      { user_id: 'en_3', name: 'Oladimeji Tiamiyu', role: 'assistant_lead' },
      { user_id: 'en_4', name: 'Michel Adimula', role: 'unit_head' },
      { user_id: 'en_5', name: 'Bro Oluseye', role: 'unit_head' },
      { user_id: 'en_6', name: 'Oladipupo Hilton', role: 'unit_head' },
      { user_id: 'en_7', name: 'Peter Ndiparya', role: 'member' },
      { user_id: 'en_8', name: 'Jemima Eromon', role: 'member' },
      { user_id: 'en_9', name: 'Jasper Eromon', role: 'member' },
      { user_id: 'en_10', name: 'Seun Morenikeji', role: 'member' },
      { user_id: 'en_11', name: 'Chase Hadley', role: 'member' },
      { user_id: 'en_12', name: 'Olukunle Ogunniran', role: 'member' },
      { user_id: 'en_13', name: 'Wade Osunmakinde', role: 'member' },
      { user_id: 'en_14', name: 'Bro Tobi', role: 'member' },
      { user_id: 'en_15', name: 'Onose Thompson', role: 'member' },
      { user_id: 'en_16', name: 'Precious Achudume', role: 'member' },
      { user_id: 'en_17', name: 'Oladeinde Omidiji', role: 'member' },
      { user_id: 'en_18', name: 'Abiodun Durojaiye', role: 'member' },
      { user_id: 'en_19', name: 'Temidayo Peters', role: 'member' },
      { user_id: 'en_20', name: 'Favour Olusanya', role: 'member' },
      { user_id: 'en_21', name: 'Favour Anwo', role: 'member' },
      { user_id: 'en_22', name: 'Damilare Akeredolu', role: 'member' },
      { user_id: 'en_23', name: 'Adeleke Matanmi', role: 'member' }
    ],
    e_nation: [
      { user_id: 'e_1', name: 'David Lee', role: 'team_lead' },
      { user_id: 'e_2', name: 'Lisa Chen', role: 'assistant_lead' },
      { user_id: 'e_3', name: 'James Park', role: 'member' }
    ]
  };

  useEffect(() => {
    loadData();
  }, [demoMode, selectedTeam]);

  const loadData = async () => {
    const teamServices = demoServices[selectedTeam] || demoServices.envoy_nation;
    const teamMembers = demoMembers[selectedTeam] || demoMembers.envoy_nation;
    
    if (demoMode) {
      setServices(teamServices);
      setMembers(teamMembers);
      setLoading(false);
      return;
    }

    try {
      const [servicesRes, membersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/services?team=${selectedTeam}`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/team/members?team=${selectedTeam}`, { credentials: 'include' })
      ]);
      
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.length > 0 ? servicesData : teamServices);
      } else {
        setServices(teamServices);
        toast.error('Unable to load services. Using demo data.');
      }
      
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.length > 0 ? membersData : teamMembers);
      } else {
        setMembers(teamMembers);
        toast.error('Unable to load team members. Using demo data.');
      }
    } catch (err) {
      console.error('Load data error:', err);
      setServices(teamServices);
      setMembers(teamMembers);
      toast.error('Error loading data. Using demo mode.');
    } finally {
      setLoading(false);
    }
  };

  const addAssignment = () => {
    if (!newAssignment.user_id || !newAssignment.role) {
      toast.error('Please select a member and role');
      return;
    }
    
    // Check if member is already assigned
    if (assignments.some(a => a.user_id === newAssignment.user_id)) {
      toast.error('This member is already assigned');
      return;
    }
    
    setAssignments([...assignments, newAssignment]);
    setNewAssignment({ user_id: '', role: '' });
    toast.success('Team member added');
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
      toast.error('Please add at least one team member assignment');
      return;
    }

    const leadName = members.find(m => m.user_id === weeklyLead)?.name || 'Unknown';

    if (demoMode) {
      // Demo mode - just show success message
      toast.success(`🎉 Rota created successfully!`, {
        description: `${leadName} assigned as weekly lead with ${assignments.length} team members. 29 checklist items auto-populated.`
      });
      setSelectedService(null);
      setWeeklyLead('');
      setAssignments([]);
      return;
    }

    try {
      // Create the rota
      const rotaResponse = await fetch(`${BACKEND_URL}/api/rotas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service_id: selectedService.service_id,
          assignments: assignments,
          notes: `Weekly Lead: ${leadName}`
        })
      });

      if (!rotaResponse.ok) {
        const errorData = await rotaResponse.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to create rota');
      }
      
      // Auto-create checklist with 29 items for the weekly lead
      const checklistResponse = await fetch(`${BACKEND_URL}/api/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service_id: selectedService.service_id,
          title: `Service Checklist - ${selectedService.title}`,
          items: CHECKLIST_ITEMS.map(text => ({ text }))
        })
      });

      if (checklistResponse.ok) {
        toast.success(`🎉 Rota created! 29 checklist items auto-assigned to ${leadName}`);
      } else {
        toast.success('Rota created successfully!');
      }

      // Send WhatsApp/In-app notifications to assigned members
      const assignedUserIds = [...new Set([weeklyLead, ...assignments.map(a => a.user_id)])];
      try {
        await fetch(`${BACKEND_URL}/api/whatsapp/notify-rota`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_ids: assignedUserIds,
            service_title: selectedService.title,
            service_date: selectedService.date,
            service_time: selectedService.time
          })
        });
        toast.info('Notifications sent to team members!');
      } catch (notifErr) {
        console.log('Notification sending skipped:', notifErr);
      }
      
      setSelectedService(null);
      setWeeklyLead('');
      setAssignments([]);
    } catch (err) {
      toast.error(err.message || 'Failed to create rota');
      console.error('Submit error:', err);
    }
  };

  const getMemberName = (userId) => {
    return members.find(m => m.user_id === userId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6" data-testid="assign-rotas-page">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Assign Rotas - {teamDisplayName}</h1>
        <p className="text-slate-400">Create service rotas and assign weekly lead for {teamDisplayName}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📅</span>
            Select Service
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {services.map((service) => (
              <button
                key={service.service_id}
                onClick={() => setSelectedService(service)}
                data-testid={`service-${service.service_id}`}
                className={`w-full text-left p-4 rounded-lg transition-all ${
                  selectedService?.service_id === service.service_id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                <p className="font-bold">{service.title}</p>
                <p className="text-sm opacity-75">{service.date} at {service.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Assignment Form */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">👥</span>
            Assign Team Members
          </h2>

          {selectedService ? (
            <div className="space-y-5">
              {/* Service Info */}
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <p className="font-bold text-lg text-white">{selectedService.title}</p>
                <p className="text-sm text-slate-400">{selectedService.date} at {selectedService.time}</p>
              </div>

              {/* Weekly Lead Selection */}
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <label className="block text-sm font-bold text-amber-400 mb-2">⭐ Weekly Lead (Responsible for 29 Checklist Items)</label>
                <select
                  value={weeklyLead}
                  onChange={(e) => setWeeklyLead(e.target.value)}
                  data-testid="weekly-lead-select"
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select Weekly Lead...</option>
                  {members.filter(m => m.role === 'admin' || m.role === 'team_lead').map((member) => (
                    <option key={member.user_id} value={member.user_id}>{member.name} ({member.role})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-2">The weekly lead will be assigned all 29 checklist items automatically</p>
              </div>

              {/* Add Assignment */}
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="font-bold text-white mb-3">Add Team Member</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Member</label>
                    <select
                      value={newAssignment.user_id}
                      onChange={(e) => setNewAssignment({ ...newAssignment, user_id: e.target.value })}
                      data-testid="member-select"
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      <option value="">Select member...</option>
                      {members.map((member) => (
                        <option key={member.user_id} value={member.user_id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                    <select
                      value={newAssignment.role}
                      onChange={(e) => setNewAssignment({ ...newAssignment, role: e.target.value })}
                      data-testid="role-select"
                      className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                    >
                      <option value="">Select role...</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  onClick={addAssignment}
                  data-testid="add-member-btn"
                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  ➕ Add Member
                </button>
              </div>

              {/* Assignments List */}
              {assignments.length > 0 && (
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3">Assigned Team ({assignments.length})</h3>
                  <div className="space-y-2">
                    {assignments.map((assignment, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                        <div>
                          <p className="font-semibold text-white">{getMemberName(assignment.user_id)}</p>
                          <p className="text-sm text-slate-400">{assignment.role}</p>
                        </div>
                        <button
                          onClick={() => removeAssignment(idx)}
                          data-testid={`remove-assignment-${idx}`}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
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
                data-testid="create-rota-btn"
                className="w-full px-6 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg"
              >
                ✅ Create Rota & Notify Team
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-6xl mb-4">👈</p>
              <p className="text-lg">Select a service to create a rota</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}