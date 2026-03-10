import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

const CHECKLIST_ITEMS = [
  { section: 'PRE-SERVICE SETUP', timing: '60 Minutes Before Service', items: [
    'Ensure all team members are present',
    'Check the rota to ensure all unit members officiating are present, if yes tick and if no have reached out?',
    'Assign specific roles and responsibilities',
    'Turn on all sockets, media appliances, screens including LED screen',
    'Inspect that all equipments are properly connected',
    'Verify cameras, switchers, and monitors',
    'Confirm HDMI cables are working',
    'Check battery levels and replace if needed',
    'Ensure proper camera angles and framing',
    'Confirm pulpit camera is properly placed',
  ]},
  { section: 'TECHNICAL RUN-THROUGH', timing: '30 Minutes Before Service', items: [
    'Check communication headsets for clear audio',
    'Ensure livestream feed audio is clear',
    'Set up laptop/system for projection and livestream',
    'Download images/videos/lyrics from WhatsApp or Drive',
    'Verify slides, lyrics, and video cues',
    'Run short cue test for smooth transitions',
    'Start streaming 5 mins before service start time',
    'Confirm overlays/lower-thirds are working',
  ]},
  { section: 'LIVE PRODUCTION MONITORING', timing: 'During Service', items: [
    'Ensure smooth camera switching and transitions',
    'Monitor video quality and adjust as needed',
    'Stay in sync with presentation and sound teams',
    'Be ready to troubleshoot issues quickly',
    'Document conflicts/challenges faced during service',
  ]},
  { section: 'EQUIPMENT HANDOVER', timing: 'Second Service', items: [
    'List all equipment collected after first service',
    'Ensure proper handover to second service team',
    'Second Service Lead signs off confirming equipment is intact',
  ]},
  { section: 'DEBRIEF & FEEDBACK', timing: '20 Minutes After Service', items: [
    'Discuss what went well and issues faced',
    'Note any equipment needing maintenance (to be done by sub unit head)',
    'Plan improvements for the next service [during weekly standup]',
  ]},
];

const ALL_ITEMS_FLAT = CHECKLIST_ITEMS.flatMap(s => s.items);

export default function AssignRotas() {
  const { profile, demoMode } = useAuth();
  const [services, setServices] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [weeklyLead, setWeeklyLead] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({ user_id: '', role: '' });
  const [loading, setLoading] = useState(true);

  const teamId = profile?.primary_team || 'envoy_nation';
  const teamDisplayName = teamId === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';

  const roles = [
    'PTZ Cam Op', 'Back Cam Op 1', 'Back Cam Op 2', 'Roam Cam Op', 'Side Cam Op',
    'Mixing Op', 'Projection Operator', 'Photographer', 'Photo Editor',
    'Video Editor', 'Livestream Director', 'Stage Manager', 'Sound Engineer',
  ];

  const demoServices = [
    { id: 'd1', service_id: 'demo_1', title: 'Sunday Service', date: '2026-03-08', time: '11:00', type: 'sunday_service' },
    { id: 'd2', service_id: 'demo_2', title: 'Leicester Blessings', date: '2026-03-12', time: '18:30', type: 'midweek' },
    { id: 'd3', service_id: 'demo_3', title: 'Connected with PMO', date: '2026-03-26', time: '18:30', type: 'special' },
  ];

  const demoMembers = [
    { id: 'dm1', user_id: 'user_adeola', name: 'Adeola Hilton', role: 'team_lead' },
    { id: 'dm2', user_id: 'user_oladimeji', name: 'Oladimeji Tiamiyu', role: 'assistant_lead' },
    { id: 'dm3', user_id: 'user_michel', name: 'Michel Adimula', role: 'unit_head' },
    { id: 'dm4', user_id: 'user_oluseye', name: 'Bro Oluseye', role: 'unit_head' },
    { id: 'dm5', user_id: 'user_oladipupo', name: 'Oladipupo Hilton', role: 'unit_head' },
    { id: 'dm6', user_id: 'user_peter_n', name: 'Peter Ndiparya', role: 'member' },
    { id: 'dm7', user_id: 'user_jasper', name: 'Jasper Eromon', role: 'member' },
    { id: 'dm8', user_id: 'user_wade', name: 'Wade Osunmakinde', role: 'member' },
    { id: 'dm9', user_id: 'user_favour_o', name: 'Favour Olusanya', role: 'member' },
    { id: 'dm10', user_id: 'user_damilare', name: 'Damilare Akeredolu', role: 'member' },
  ];

  useEffect(() => {
    loadData();
  }, [demoMode, teamId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    if (demoMode) {
      setServices(demoServices);
      setMembers(demoMembers);
      setLoading(false);
      return;
    }

    try {
      const [servicesRes, membersRes] = await Promise.all([
        supabase.from('services').select('*').eq('team_id', teamId).order('date', { ascending: true }),
        supabase.from('profiles').select('id, user_id, name, role, unit').or(`primary_team.eq.${teamId},teams.cs.{${teamId}}`).order('name'),
      ]);

      setServices(servicesRes.data || []);
      setMembers(membersRes.data || []);
    } catch (err) {
      console.error('Load data error:', err);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const addAssignment = () => {
    if (!newAssignment.user_id || !newAssignment.role) {
      toast.error('Please select a member and role');
      return;
    }
    if (assignments.some(a => a.user_id === newAssignment.user_id)) {
      toast.error('This member is already assigned');
      return;
    }
    const member = members.find(m => m.user_id === newAssignment.user_id || m.id === newAssignment.user_id);
    setAssignments([...assignments, { ...newAssignment, name: member?.name || 'Unknown' }]);
    setNewAssignment({ user_id: '', role: '' });
    toast.success('Team member added');
  };

  const removeAssignment = (index) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  const submitRota = async () => {
    if (!selectedService) { toast.error('Please select a service'); return; }
    if (!weeklyLead) { toast.error('Please select a weekly lead'); return; }
    if (assignments.length === 0) { toast.error('Please add at least one team member'); return; }

    const leadMember = members.find(m => m.user_id === weeklyLead || m.id === weeklyLead);
    const leadName = leadMember?.name || 'Unknown';

    if (demoMode) {
      toast.success(`Rota created! ${leadName} assigned as weekly lead with ${assignments.length} members. 29 checklist items auto-populated.`);
      setSelectedService(null);
      setWeeklyLead('');
      setAssignments([]);
      return;
    }

    try {
      const serviceId = selectedService.service_id || selectedService.id;
      const rotaAssignments = assignments.map(a => ({
        ...a, status: 'pending'
      }));

      const { error: rotaError } = await supabase
        .from('rotas')
        .insert({
          service_id: serviceId,
          team_id: teamId,
          assignments: rotaAssignments,
          status: 'draft',
        });

      if (rotaError) throw rotaError;

      // Auto-create checklist with 29 items
      let idx = 0;
      const checklistItems = CHECKLIST_ITEMS.flatMap(section =>
        section.items.map(text => ({
          id: `chk_${++idx}`,
          text,
          checked: false,
          section: section.section,
        }))
      );

      const { error: checklistError } = await supabase
        .from('checklists')
        .insert({
          service_id: serviceId,
          team_id: teamId,
          title: `Service Checklist - ${selectedService.title}`,
          items: checklistItems,
        });

      if (checklistError) {
        console.error('Checklist creation error:', checklistError);
      }

      toast.success(`Rota created! 29 checklist items assigned to ${leadName}`);
      setSelectedService(null);
      setWeeklyLead('');
      setAssignments([]);
    } catch (err) {
      toast.error(err.message || 'Failed to create rota');
      console.error('Submit error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="assign-rotas-page">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Assign Rotas - {teamDisplayName}</h1>
        <p className="text-slate-400 mt-1">Create service rotas and assign weekly lead</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">Select Service</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {services.length === 0 && (
              <p className="text-slate-500 text-sm">No services found</p>
            )}
            {services.map((service) => (
              <button
                key={service.service_id || service.id}
                onClick={() => setSelectedService(service)}
                data-testid={`service-${service.service_id || service.id}`}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedService?.service_id === service.service_id || selectedService?.id === service.id
                    ? 'bg-white text-slate-900 shadow-lg'
                    : 'bg-slate-800/50 hover:bg-slate-700/50 text-white border border-slate-700'
                }`}
              >
                <p className="font-medium">{service.title}</p>
                <p className="text-sm opacity-75">{service.date} at {service.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Assignment Form */}
        <div className="lg:col-span-2 bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">Assign Team Members</h2>

          {selectedService ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <p className="font-bold text-white">{selectedService.title}</p>
                <p className="text-sm text-slate-400">{selectedService.date} at {selectedService.time}</p>
              </div>

              {/* Weekly Lead */}
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <label className="block text-sm font-bold text-amber-400 mb-2">Weekly Lead ({ALL_ITEMS_FLAT.length} Checklist Items)</label>
                <select
                  value={weeklyLead}
                  onChange={(e) => setWeeklyLead(e.target.value)}
                  data-testid="weekly-lead-select"
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-xl text-white"
                >
                  <option value="">Select Weekly Lead...</option>
                  {members.filter(m => ['director', 'team_lead', 'assistant_lead', 'unit_head'].includes(m.role)).map((m) => (
                    <option key={m.user_id || m.id} value={m.user_id || m.id}>{m.name} ({m.role?.replace('_', ' ')})</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-2">The weekly lead will be responsible for all 29 checklist items</p>
              </div>

              {/* Add Assignment */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                <h3 className="font-bold text-white mb-3">Add Team Member</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Member</label>
                    <select
                      value={newAssignment.user_id}
                      onChange={(e) => setNewAssignment({ ...newAssignment, user_id: e.target.value })}
                      data-testid="member-select"
                      className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm"
                    >
                      <option value="">Select member...</option>
                      {members.map((m) => (
                        <option key={m.user_id || m.id} value={m.user_id || m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Role</label>
                    <select
                      value={newAssignment.role}
                      onChange={(e) => setNewAssignment({ ...newAssignment, role: e.target.value })}
                      data-testid="role-select"
                      className="w-full p-2.5 bg-slate-700 border border-slate-600 rounded-xl text-white text-sm"
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
                  className="mt-3 w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                >
                  + Add Member
                </button>
              </div>

              {/* Assignments List */}
              {assignments.length > 0 && (
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <h3 className="font-bold text-green-400 mb-3">Assigned Team ({assignments.length})</h3>
                  <div className="space-y-2">
                    {assignments.map((a, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                        <div>
                          <p className="font-medium text-white">{a.name}</p>
                          <p className="text-sm text-slate-400">{a.role}</p>
                        </div>
                        <button
                          onClick={() => removeAssignment(idx)}
                          data-testid={`remove-assignment-${idx}`}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={submitRota}
                data-testid="create-rota-btn"
                className="w-full px-6 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all"
              >
                Create Rota & Auto-Generate Checklist
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-5xl mb-4">👈</p>
              <p>Select a service to create a rota</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
