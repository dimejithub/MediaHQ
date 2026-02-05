import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DEMO_EQUIPMENT = {
  envoy_nation: [
    { equipment_id: 'demo_en_1', name: 'Sony PTZ Camera', category: 'camera', status: 'available', notes: 'Main pulpit camera', team: 'envoy_nation' },
    { equipment_id: 'demo_en_2', name: 'Blackmagic ATEM Mini', category: 'video_switcher', status: 'available', notes: 'Live switching', team: 'envoy_nation' },
    { equipment_id: 'demo_en_3', name: 'Shure SM58 Mic', category: 'audio', status: 'checked_out', notes: 'Handheld microphone', team: 'envoy_nation' },
    { equipment_id: 'demo_en_4', name: 'Dell Laptop', category: 'computer', status: 'available', notes: 'For ProPresenter', team: 'envoy_nation' }
  ],
  e_nation: [
    { equipment_id: 'demo_e_1', name: 'Canon XA50 Camera', category: 'camera', status: 'available', notes: 'Main camera', team: 'e_nation' },
    { equipment_id: 'demo_e_2', name: 'Yamaha MG10XU Mixer', category: 'audio', status: 'available', notes: 'Audio mixer', team: 'e_nation' },
    { equipment_id: 'demo_e_3', name: 'LED Panel Light', category: 'lighting', status: 'maintenance', notes: 'Needs repair', team: 'e_nation' }
  ]
};

export default function Equipment() {
  const { demoMode, user, selectedTeam } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEquipment, setNewEquipment] = useState({ name: '', category: 'camera', notes: '' });

  const categories = ['camera', 'audio', 'lighting', 'computer', 'cable', 'video_switcher', 'other'];
  const teamDisplayName = selectedTeam === 'envoy_nation' ? 'Envoy Nation' : 'E-Nation';

  useEffect(() => {
    const demoData = DEMO_EQUIPMENT[selectedTeam] || DEMO_EQUIPMENT.envoy_nation;
    
    if (demoMode) {
      setEquipment(demoData);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/equipment?team=${selectedTeam}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setEquipment(data.length > 0 ? data : demoData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setEquipment(demoData);
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

  const isAdmin = user?.role === 'admin' || user?.role === 'team_lead';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="equipment-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{teamDisplayName} Equipment</h1>
          <p className="text-slate-400">Track and manage {teamDisplayName} media equipment</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-equipment-btn"
            className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
          >
            ➕ Add Equipment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <div key={item.equipment_id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all" data-testid={`equipment-${item.equipment_id}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                <p className="text-sm text-slate-400 capitalize">{item.category?.replace('_', ' ')}</p>
              </div>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteEquipment(item.equipment_id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                  data-testid={`delete-equipment-${item.equipment_id}`}
                >
                  🗑️
                </button>
              )}
            </div>
            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 ${
              item.status === 'available' ? 'bg-green-500/20 text-green-400' : 
              item.status === 'checked_out' ? 'bg-orange-500/20 text-orange-400' :
              'bg-red-500/20 text-red-400'
            }`}>{item.status?.replace('_', ' ')}</span>
            {item.notes && <p className="text-sm text-slate-400 mb-4">{item.notes}</p>}
            {item.status === 'available' ? (
              <button onClick={() => handleCheckout(item.equipment_id)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all">Check Out</button>
            ) : item.status === 'checked_out' ? (
              <button onClick={() => handleCheckin(item.equipment_id)} className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-600 transition-all">Check In</button>
            ) : null}
          </div>
        ))}
      </div>

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Add New Equipment</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Equipment Name</label>
                <input
                  type="text"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., Sony Camera"
                  data-testid="equipment-name-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                  value={newEquipment.category}
                  onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  data-testid="equipment-category-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes (optional)</label>
                <textarea
                  value={newEquipment.notes}
                  onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  rows={2}
                  placeholder="Any additional notes..."
                  data-testid="equipment-notes-input"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEquipment}
                data-testid="confirm-add-equipment-btn"
                className="flex-1 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
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