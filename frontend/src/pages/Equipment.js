import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DEMO_EQUIPMENT = {
  envoy_nation: [
    { equipment_id: 'en_eq_1', name: 'PTZ Camera', category: 'camera', status: 'available', notes: 'Main pulpit camera for livestream', team: 'envoy_nation' },
    { equipment_id: 'en_eq_2', name: 'Panasonic Lumix DC-G9 #1', category: 'camera', status: 'available', notes: 'Photography camera - working condition', team: 'envoy_nation' },
    { equipment_id: 'en_eq_3', name: 'Panasonic Lumix DC-G9 #2', category: 'camera', status: 'maintenance', notes: 'Photography camera - needs repair', team: 'envoy_nation' },
    { equipment_id: 'en_eq_4', name: 'Canon EOS 850D', category: 'camera', status: 'maintenance', notes: 'FAULTY - requires servicing', team: 'envoy_nation' },
    { equipment_id: 'en_eq_5', name: 'BlackMagic Camera', category: 'camera', status: 'available', notes: 'Production camera', team: 'envoy_nation' },
    { equipment_id: 'en_eq_6', name: 'Mac Mini Pro', category: 'computer', status: 'available', notes: 'Main production computer for editing and ProPresenter', team: 'envoy_nation' }
  ],
  e_nation: [
    { equipment_id: 'e_eq_1', name: 'Canon XA50 Camera', category: 'camera', status: 'available', notes: 'Main camera', team: 'e_nation' },
    { equipment_id: 'e_eq_2', name: 'Yamaha MG10XU Mixer', category: 'audio', status: 'available', notes: 'Audio mixer', team: 'e_nation' },
    { equipment_id: 'e_eq_3', name: 'LED Panel Light', category: 'lighting', status: 'available', notes: 'Studio lighting', team: 'e_nation' }
  ]
};

const DEMO_HANDOVERS = [
  { handover_id: 'h1', equipment_id: 'en_eq_1', equipment_name: 'PTZ Camera', from_team: 'envoy_nation', to_team: 'e_nation', from_user: 'Dr. Adebowale Owoseni', to_user: 'David Lee', condition_before: 'good', condition_notes: 'Working perfectly', handover_date: '2025-02-01', created_at: '2025-02-01T10:00:00Z' },
  { handover_id: 'h2', equipment_id: 'en_eq_5', equipment_name: 'BlackMagic Camera', from_team: 'e_nation', to_team: 'envoy_nation', from_user: 'David Lee', to_user: 'Adeola Hilton', condition_before: 'fair', condition_notes: 'Minor scratches on body', handover_date: '2025-01-28', created_at: '2025-01-28T14:30:00Z' }
];

const DEMO_MEMBERS = {
  envoy_nation: [
    { user_id: 'en_1', name: 'Dr. Adebowale Owoseni' },
    { user_id: 'en_2', name: 'Adeola Hilton' },
    { user_id: 'en_3', name: 'Oladimeji Tiamiyu' },
    { user_id: 'en_4', name: 'Michel Adimula' },
    { user_id: 'en_5', name: 'Bro Oluseye' }
  ],
  e_nation: [
    { user_id: 'e_1', name: 'David Lee' },
    { user_id: 'e_2', name: 'Lisa Chen' },
    { user_id: 'e_3', name: 'James Park' }
  ]
};

function InventoryTab({ equipment, handleCheckout, handleCheckin, handleDeleteEquipment, setShowAddModal, isAdmin, teamDisplayName }) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-slate-400 text-sm sm:text-base">Track and manage {teamDisplayName} media equipment</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-equipment-btn"
            className="w-full sm:w-auto px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all text-sm sm:text-base"
          >
            + Add Equipment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {equipment.map((item) => (
          <div key={item.equipment_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 hover:border-slate-700 transition-all" data-testid={`equipment-${item.equipment_id}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">{item.name}</h3>
                <p className="text-xs sm:text-sm text-slate-400 capitalize">{item.category?.replace('_', ' ')}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteEquipment(item.equipment_id)}
                  className="text-red-400 hover:text-red-300 text-sm ml-2 flex-shrink-0"
                  data-testid={`delete-equipment-${item.equipment_id}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 ${
              item.status === 'available' ? 'bg-green-500/20 text-green-400' : 
              item.status === 'checked_out' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>{item.status?.replace('_', ' ')}</span>
            {item.notes && <p className="text-xs sm:text-sm text-slate-400 mb-4 line-clamp-2">{item.notes}</p>}
            {item.status === 'available' ? (
              <button onClick={() => handleCheckout(item.equipment_id)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all text-sm">Check Out</button>
            ) : item.status === 'checked_out' ? (
              <button onClick={() => handleCheckin(item.equipment_id)} className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all text-sm">Check In</button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

function HandoversTab({ handovers, equipment, members, demoMode, selectedTeam, onCreateHandover, isAdmin }) {
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverForm, setHandoverForm] = useState({
    equipment_id: '',
    to_team: selectedTeam === 'envoy_nation' ? 'e_nation' : 'envoy_nation',
    to_user_id: '',
    condition_before: 'good',
    condition_notes: ''
  });

  const handleSubmitHandover = () => {
    if (!handoverForm.equipment_id || !handoverForm.to_user_id) {
      toast.error('Please select equipment and receiving member');
      return;
    }
    onCreateHandover(handoverForm);
    setShowHandoverModal(false);
    setHandoverForm({
      equipment_id: '',
      to_team: selectedTeam === 'envoy_nation' ? 'e_nation' : 'envoy_nation',
      to_user_id: '',
      condition_before: 'good',
      condition_notes: ''
    });
  };

  const destinationTeam = handoverForm.to_team;
  const destinationMembers = demoMode 
    ? DEMO_MEMBERS[destinationTeam] || [] 
    : members.filter(m => m.team === destinationTeam);

  const getConditionBadge = (condition) => {
    const colors = {
      good: 'bg-green-500/20 text-green-400',
      fair: 'bg-yellow-500/20 text-yellow-400',
      needs_repair: 'bg-red-500/20 text-red-400'
    };
    return colors[condition] || colors.fair;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-slate-400 text-sm sm:text-base">Track equipment transfers between teams</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowHandoverModal(true)}
            data-testid="new-handover-btn"
            className="w-full sm:w-auto px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            New Handover
          </button>
        )}
      </div>

      {/* Handover History */}
      {handovers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No Handovers Yet</h3>
          <p className="text-slate-400 text-sm">Equipment transfers between teams will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {handovers.map((handover) => (
            <div key={handover.handover_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 hover:border-slate-700 transition-all" data-testid={`handover-${handover.handover_id}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Equipment & Date */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">{handover.equipment_name}</h3>
                      <p className="text-xs text-slate-500">{formatDate(handover.handover_date)}</p>
                    </div>
                  </div>
                </div>

                {/* Transfer Flow */}
                <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-center">
                  <div className="text-center min-w-0">
                    <p className="text-xs text-slate-500 mb-1">From</p>
                    <p className="text-sm font-medium text-white truncate max-w-[100px] sm:max-w-none">{handover.from_user}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                      handover.from_team === 'envoy_nation' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {handover.from_team === 'envoy_nation' ? 'Envoy' : 'E-Nation'}
                    </span>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  <div className="text-center min-w-0">
                    <p className="text-xs text-slate-500 mb-1">To</p>
                    <p className="text-sm font-medium text-white truncate max-w-[100px] sm:max-w-none">{handover.to_user}</p>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full mt-1 ${
                      handover.to_team === 'envoy_nation' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {handover.to_team === 'envoy_nation' ? 'Envoy' : 'E-Nation'}
                    </span>
                  </div>
                </div>

                {/* Condition */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-500 mb-1">Condition</p>
                  <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${getConditionBadge(handover.condition_before)}`}>
                    {handover.condition_before?.replace('_', ' ')}
                  </span>
                  {handover.condition_notes && (
                    <p className="text-xs text-slate-400 mt-1 max-w-[150px] truncate" title={handover.condition_notes}>
                      {handover.condition_notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Handover Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">New Equipment Handover</h2>
              <p className="text-sm text-slate-400 mt-1">Transfer equipment to another team</p>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Equipment Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Equipment *</label>
                <select
                  value={handoverForm.equipment_id}
                  onChange={(e) => setHandoverForm({...handoverForm, equipment_id: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none"
                  data-testid="handover-equipment-select"
                >
                  <option value="">Select equipment...</option>
                  {equipment.filter(e => e.status === 'available').map(eq => (
                    <option key={eq.equipment_id} value={eq.equipment_id}>{eq.name}</option>
                  ))}
                </select>
              </div>

              {/* Destination Team */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Transfer To Team *</label>
                <select
                  value={handoverForm.to_team}
                  onChange={(e) => setHandoverForm({...handoverForm, to_team: e.target.value, to_user_id: ''})}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none"
                  data-testid="handover-team-select"
                >
                  <option value="envoy_nation">🔵 Envoy Nation</option>
                  <option value="e_nation">🟢 E-Nation</option>
                </select>
              </div>

              {/* Receiving Member */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Receiving Member *</label>
                <select
                  value={handoverForm.to_user_id}
                  onChange={(e) => setHandoverForm({...handoverForm, to_user_id: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none"
                  data-testid="handover-member-select"
                >
                  <option value="">Select member...</option>
                  {destinationMembers.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Equipment Condition</label>
                <div className="grid grid-cols-3 gap-2">
                  {['good', 'fair', 'needs_repair'].map(condition => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => setHandoverForm({...handoverForm, condition_before: condition})}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        handoverForm.condition_before === condition
                          ? condition === 'good' 
                            ? 'bg-green-500/30 text-green-400 border border-green-500/50' 
                            : condition === 'fair' 
                              ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'
                              : 'bg-red-500/30 text-red-400 border border-red-500/50'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      {condition === 'needs_repair' ? 'Needs Repair' : condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Condition Notes (optional)</label>
                <textarea
                  value={handoverForm.condition_notes}
                  onChange={(e) => setHandoverForm({...handoverForm, condition_notes: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none resize-none"
                  rows={3}
                  placeholder="Any scratches, issues, or notes about the equipment..."
                  data-testid="handover-notes-input"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setShowHandoverModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitHandover}
                data-testid="confirm-handover-btn"
                className="flex-1 px-4 py-2.5 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
              >
                Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Equipment() {
  const { demoMode, user, selectedTeam } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEquipment, setNewEquipment] = useState({ name: '', category: 'camera', notes: '' });

  const categories = ['camera', 'audio', 'lighting', 'computer', 'cable', 'video_switcher', 'other'];
  const teamDisplayName = selectedTeam === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';
  const isAdmin = user?.role === 'admin' || user?.role === 'team_lead' || user?.role === 'director' || user?.role === 'assistant_lead';

  useEffect(() => {
    const demoData = DEMO_EQUIPMENT[selectedTeam] || DEMO_EQUIPMENT.envoy_nation;
    
    if (demoMode) {
      setEquipment(demoData);
      setHandovers(DEMO_HANDOVERS);
      setMembers([...DEMO_MEMBERS.envoy_nation, ...DEMO_MEMBERS.e_nation]);
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${BACKEND_URL}/api/equipment?team=${selectedTeam}`, { credentials: 'include' }).then(r => r.ok ? r.json() : demoData),
      fetch(`${BACKEND_URL}/api/equipment/handovers`, { credentials: 'include' }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${BACKEND_URL}/api/team/members`, { credentials: 'include' }).then(r => r.ok ? r.json() : []).catch(() => [])
    ]).then(([equipData, handoverData, memberData]) => {
      setEquipment(equipData.length > 0 ? equipData : demoData);
      setHandovers(handoverData);
      setMembers(memberData);
      setLoading(false);
    }).catch(() => {
      setEquipment(demoData);
      setHandovers(DEMO_HANDOVERS);
      setLoading(false);
    });
  }, [demoMode, selectedTeam]);

  const handleCheckout = async (id) => {
    if (demoMode) {
      setEquipment(equipment.map(e => e.equipment_id === id ? { ...e, status: 'checked_out' } : e));
      toast.success('Equipment checked out');
      return;
    }
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/equipment/${id}/checkout`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        setEquipment(equipment.map(e => e.equipment_id === id ? { ...e, status: 'checked_out' } : e));
        toast.success('Equipment checked out');
      }
    } catch (err) {
      toast.error('Failed to check out equipment');
    }
  };

  const handleCheckin = async (id) => {
    if (demoMode) {
      setEquipment(equipment.map(e => e.equipment_id === id ? { ...e, status: 'available' } : e));
      toast.success('Equipment checked in');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/equipment/${id}/checkin`, { method: 'PUT', credentials: 'include' });
      if (res.ok) {
        setEquipment(equipment.map(e => e.equipment_id === id ? { ...e, status: 'available' } : e));
        toast.success('Equipment checked in');
      }
    } catch (err) {
      toast.error('Failed to check in equipment');
    }
  };

  const handleAddEquipment = async () => {
    if (!newEquipment.name) {
      toast.error('Please enter equipment name');
      return;
    }

    if (demoMode) {
      const newItem = {
        equipment_id: `demo_${Date.now()}`,
        ...newEquipment,
        status: 'available',
        team: selectedTeam
      };
      setEquipment([...equipment, newItem]);
      setNewEquipment({ name: '', category: 'camera', notes: '' });
      setShowAddModal(false);
      toast.success(`Equipment added to ${teamDisplayName}`);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...newEquipment, team_id: selectedTeam })
      });
      
      if (res.ok) {
        const data = await res.json();
        setEquipment([...equipment, data]);
        setNewEquipment({ name: '', category: 'camera', notes: '' });
        setShowAddModal(false);
        toast.success('Equipment added');
      } else {
        throw new Error('Failed to add');
      }
    } catch (err) {
      toast.error('Failed to add equipment');
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (demoMode) {
      setEquipment(equipment.filter(e => e.equipment_id !== id));
      toast.success('Equipment deleted');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/equipment/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setEquipment(equipment.filter(e => e.equipment_id !== id));
        toast.success('Equipment deleted');
      }
    } catch (err) {
      toast.error('Failed to delete equipment');
    }
  };

  const handleCreateHandover = async (formData) => {
    const selectedEquipment = equipment.find(e => e.equipment_id === formData.equipment_id);
    const toMember = demoMode 
      ? [...DEMO_MEMBERS.envoy_nation, ...DEMO_MEMBERS.e_nation].find(m => m.user_id === formData.to_user_id)
      : members.find(m => m.user_id === formData.to_user_id);
    
    if (demoMode) {
      const newHandover = {
        handover_id: `h_${Date.now()}`,
        equipment_id: formData.equipment_id,
        equipment_name: selectedEquipment?.name || 'Unknown',
        from_team: selectedTeam,
        to_team: formData.to_team,
        from_user: user?.name || 'Current User',
        to_user: toMember?.name || 'Unknown',
        condition_before: formData.condition_before,
        condition_notes: formData.condition_notes,
        handover_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      };
      setHandovers([newHandover, ...handovers]);
      toast.success('Equipment handover recorded');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/equipment/handover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        const data = await res.json();
        setHandovers([data, ...handovers]);
        toast.success('Equipment handover recorded');
      } else {
        throw new Error('Failed to create handover');
      }
    } catch (err) {
      toast.error('Failed to record handover');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8" data-testid="equipment-page">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{teamDisplayName} Equipment</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-slate-900 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'inventory' 
              ? 'bg-white text-slate-900' 
              : 'text-slate-400 hover:text-white'
          }`}
          data-testid="inventory-tab"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Inventory
          </span>
        </button>
        <button
          onClick={() => setActiveTab('handovers')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'handovers' 
              ? 'bg-white text-slate-900' 
              : 'text-slate-400 hover:text-white'
          }`}
          data-testid="handovers-tab"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Handovers
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' ? (
        <InventoryTab 
          equipment={equipment}
          handleCheckout={handleCheckout}
          handleCheckin={handleCheckin}
          handleDeleteEquipment={handleDeleteEquipment}
          setShowAddModal={setShowAddModal}
          isAdmin={isAdmin}
          teamDisplayName={teamDisplayName}
        />
      ) : (
        <HandoversTab 
          handovers={handovers}
          equipment={equipment}
          members={members}
          demoMode={demoMode}
          selectedTeam={selectedTeam}
          onCreateHandover={handleCreateHandover}
          isAdmin={isAdmin}
        />
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Add New Equipment</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Equipment Name *</label>
                <input
                  type="text"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none"
                  placeholder="e.g., Sony Camera"
                  data-testid="equipment-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
                <select
                  value={newEquipment.category}
                  onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none"
                  data-testid="equipment-category-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes (optional)</label>
                <textarea
                  value={newEquipment.notes}
                  onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-blue-500 outline-none resize-none"
                  rows={2}
                  placeholder="Any additional notes..."
                  data-testid="equipment-notes-input"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEquipment}
                data-testid="confirm-add-equipment-btn"
                className="flex-1 px-4 py-2.5 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
              >
                Add Equipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
