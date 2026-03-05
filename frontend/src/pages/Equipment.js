import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Equipment() {
  const { profile, demoMode } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    category: 'camera',
    status: 'available',
    notes: ''
  });

  const teamId = profile?.primary_team || 'envoy_nation';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchEquipment(); }, [demoMode, teamId]);

  useEffect(() => {
    if (demoMode) return;
    const channel = supabase
      .channel('equipment-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, () => {
        fetchEquipment();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [demoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEquipment = async () => {
    if (demoMode) {
      setEquipment([
        { id: '1', equipment_id: 'equip_1', name: 'Sony A7III Camera', category: 'camera', status: 'available', team_id: 'envoy_nation' },
        { id: '2', equipment_id: 'equip_2', name: 'Rode Wireless Go II', category: 'audio', status: 'checked_out', checked_out_by: 'Michel', team_id: 'envoy_nation' },
        { id: '3', equipment_id: 'equip_3', name: 'Blackmagic ATEM Mini', category: 'video', status: 'available', team_id: 'envoy_nation' },
        { id: '4', equipment_id: 'equip_4', name: 'Shure SM58 Microphone', category: 'audio', status: 'available', team_id: 'envoy_nation' },
        { id: '5', equipment_id: 'equip_5', name: 'LED Panel Light', category: 'lighting', status: 'maintenance', team_id: 'envoy_nation' },
        { id: '6', equipment_id: 'equip_6', name: 'Tripod Manfrotto', category: 'support', status: 'available', team_id: 'envoy_nation' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (error) throw error;
      setEquipment(data || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    
    if (demoMode) {
      const newItem = {
        id: Date.now().toString(),
        equipment_id: `equip_${Date.now()}`,
        ...newEquipment,
        team_id: teamId
      };
      setEquipment([...equipment, newItem]);
      setShowAddModal(false);
      setNewEquipment({ name: '', category: 'camera', status: 'available', notes: '' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert([{ ...newEquipment, team_id: teamId }])
        .select()
        .single();

      if (error) throw error;
      setEquipment([...equipment, data]);
      setShowAddModal(false);
      setNewEquipment({ name: '', category: 'camera', status: 'available', notes: '' });
    } catch (err) {
      console.error('Error adding equipment:', err);
      alert('Failed to add equipment');
    }
  };

  const handleCheckout = async (item) => {
    if (demoMode) {
      setEquipment(equipment.map(e => 
        e.id === item.id 
          ? { ...e, status: 'checked_out', checked_out_by: profile?.name }
          : e
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('equipment')
        .update({ 
          status: 'checked_out', 
          checked_out_by: profile?.name || profile?.email,
          checked_out_at: new Date().toISOString()
        })
        .eq('id', item.id);

      if (error) throw error;
      fetchEquipment();
    } catch (err) {
      console.error('Error checking out:', err);
    }
  };

  const handleReturn = async (item) => {
    if (demoMode) {
      setEquipment(equipment.map(e => 
        e.id === item.id 
          ? { ...e, status: 'available', checked_out_by: null }
          : e
      ));
      return;
    }

    try {
      const { error } = await supabase
        .from('equipment')
        .update({ 
          status: 'available', 
          checked_out_by: null,
          checked_out_at: null
        })
        .eq('id', item.id);

      if (error) throw error;
      fetchEquipment();
    } catch (err) {
      console.error('Error returning:', err);
    }
  };

  const filteredEquipment = equipment.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  );

  const getStatusBadge = (status) => {
    const badges = {
      available: { bg: 'bg-green-500/20 text-green-400', label: 'Available' },
      checked_out: { bg: 'bg-orange-500/20 text-orange-400', label: 'Checked Out' },
      maintenance: { bg: 'bg-red-500/20 text-red-400', label: 'Maintenance' },
    };
    return badges[status] || badges.available;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      camera: '📷',
      audio: '🎤',
      video: '🎬',
      lighting: '💡',
      support: '🔧',
    };
    return icons[category] || '📦';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading equipment...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Equipment</h1>
          <p className="text-slate-400 mt-1">
            {equipment.filter(e => e.status === 'available').length} of {equipment.length} available
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          + Add Equipment
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'available', 'checked_out', 'maintenance'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${
              filterStatus === status 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-800 text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-slate-400">No equipment found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item) => (
            <div
              key={item.id || item.equipment_id}
              className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                  {getCategoryIcon(item.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{item.name}</h3>
                  <p className="text-slate-400 text-sm capitalize">{item.category}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(item.status).bg}`}>
                  {getStatusBadge(item.status).label}
                </span>
                {item.status === 'available' ? (
                  <button
                    onClick={() => handleCheckout(item)}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-all"
                  >
                    Check Out
                  </button>
                ) : item.status === 'checked_out' ? (
                  <button
                    onClick={() => handleReturn(item)}
                    className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-all"
                  >
                    Return
                  </button>
                ) : null}
              </div>
              {item.checked_out_by && (
                <p className="mt-2 text-slate-500 text-xs">Checked out by: {item.checked_out_by}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-6">Add Equipment</h2>
            <form onSubmit={handleAddEquipment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={newEquipment.name}
                  onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  placeholder="e.g., Sony A7III Camera"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={newEquipment.category}
                  onChange={(e) => setNewEquipment({ ...newEquipment, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="camera">Camera</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="lighting">Lighting</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Notes (optional)</label>
                <textarea
                  value={newEquipment.notes}
                  onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium"
                >
                  Add Equipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
