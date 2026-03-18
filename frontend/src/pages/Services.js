import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';
import { supabase } from '@/lib/supabaseClient';

// Fallback upcoming services if Supabase table is empty
const FALLBACK_SERVICES = [
  { id: 'svc_1', title: 'Sunday Service', date: '2026-03-22', time: '11:00', type: 'sunday_service', team: 'envoy_nation', location: 'Main Auditorium' },
  { id: 'svc_2', title: 'Leicester Blessing', date: '2026-03-19', time: '18:30', type: 'midweek_service', team: 'envoy_nation', location: 'Main Auditorium' },
  { id: 'svc_3', title: 'Connected with PMO', date: '2026-03-26', time: '18:30', type: 'special', team: 'envoy_nation', location: 'Main Auditorium' },
  { id: 'svc_4', title: 'Sunday Service', date: '2026-03-29', time: '11:00', type: 'sunday_service', team: 'envoy_nation', location: 'Main Auditorium' },
  { id: 'svc_5', title: 'The Commissioned Envoy', date: '2026-03-22', time: '14:00', type: 'sunday_service', team: 'e_nation', location: 'Main Auditorium' },
];

const TYPE_LABELS = {
  sunday_service: { label: 'Sunday Service', color: 'bg-blue-500/20 text-blue-400' },
  midweek_service: { label: 'Midweek', color: 'bg-purple-500/20 text-purple-400' },
  leicester_blessings: { label: 'Leicester Blessing', color: 'bg-purple-500/20 text-purple-400' },
  connected_pmo: { label: 'Connected w/ PMO', color: 'bg-amber-500/20 text-amber-400' },
  special: { label: 'Special', color: 'bg-pink-500/20 text-pink-400' },
  tuesday_standup: { label: 'Standup', color: 'bg-green-500/20 text-green-400' },
};

export default function Services() {
  const { demoMode, selectedTeam, user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [newService, setNewService] = useState({ title: '', date: '', time: '11:00', type: 'sunday_service', location: 'Main Auditorium' });

  const isAdmin = ['director', 'admin', 'team_lead', 'assistant_lead'].includes(user?.role);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { loadServices(); }, [demoMode, selectedTeam]);

  const loadServices = async () => {
    setLoading(true);
    if (demoMode) {
      setServices(FALLBACK_SERVICES.filter(s => s.team === selectedTeam || s.team === 'all'));
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      const filtered = (data || []).filter(s => !s.team || s.team === selectedTeam || s.team === 'all');
      setServices(filtered.length > 0 ? filtered : FALLBACK_SERVICES.filter(s => s.team === selectedTeam));
    } catch (err) {
      console.error('Services load error:', err);
      setServices(FALLBACK_SERVICES.filter(s => s.team === selectedTeam));
    } finally {
      setLoading(false);
    }
  };

  const addService = async () => {
    if (!newService.title || !newService.date) { toast.error('Title and date required'); return; }
    if (demoMode) {
      setServices([...services, { ...newService, id: `demo_${Date.now()}`, team: selectedTeam }]);
      setShowAddModal(false);
      toast.success('Service added');
      return;
    }
    const { error } = await supabase.from('services').insert({ ...newService, team: selectedTeam });
    if (error) { toast.error('Failed to add service'); return; }
    toast.success('Service added');
    setShowAddModal(false);
    loadServices();
  };

  const deleteService = async (id) => {
    if (demoMode) { setServices(services.filter(s => s.id !== id)); toast.success('Deleted'); return; }
    await supabase.from('services').delete().eq('id', id);
    setServices(services.filter(s => s.id !== id));
    toast.success('Service deleted');
  };

  const filtered = services.filter(s => {
    if (filter === 'upcoming') return s.date >= today;
    if (filter === 'past') return s.date < today;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = services.filter(s => s.date >= today).length;

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading services...</div></div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Services</h1>
          <p className="text-slate-400 text-sm">{upcoming} upcoming service{upcoming !== 1 ? 's' : ''} scheduled</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all text-sm">
            + Add Service
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['upcoming', 'past', 'all'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${filter === f ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Services list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-5xl mb-4">🗓️</p>
          <p className="text-lg font-medium">No {filter} services</p>
          {isAdmin && <p className="text-sm mt-2">Add a service using the button above</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(service => {
            const typeInfo = TYPE_LABELS[service.type] || { label: service.type, color: 'bg-slate-500/20 text-slate-400' };
            const isPast = service.date < today;
            const serviceDate = new Date(service.date + 'T12:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={service.id || service.service_id} className={`bg-slate-900 rounded-xl p-4 sm:p-5 border transition-all hover:border-slate-600 ${isPast ? 'border-slate-800 opacity-60' : 'border-slate-700'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isPast ? 'bg-slate-800' : 'bg-slate-800'}`}>
                      {service.type?.includes('sunday') ? '⛪' : service.type?.includes('midweek') || service.type?.includes('blessing') ? '🙏' : service.type?.includes('pmo') ? '📡' : '✨'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-white text-base">{service.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                        {isPast && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">Past</span>}
                      </div>
                      <p className="text-sm text-slate-400">{serviceDate}</p>
                      <p className="text-sm text-slate-400">{service.time} · {service.location || 'Main Auditorium'}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={() => deleteService(service.id || service.service_id)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl w-full max-w-md border border-slate-700">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-bold text-white">Add Service</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input type="text" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" placeholder="e.g. Sunday Service" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                  <input type="date" value={newService.date} onChange={e => setNewService({...newService, date: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Time</label>
                  <input type="time" value={newService.time} onChange={e => setNewService({...newService, time: e.target.value})}
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select value={newService.type} onChange={e => setNewService({...newService, type: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
                  {Object.entries(TYPE_LABELS).map(([val, {label}]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                <input type="text" value={newService.location} onChange={e => setNewService({...newService, location: e.target.value})}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" placeholder="Main Auditorium" />
              </div>
            </div>
            <div className="p-6 border-t border-slate-800 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-slate-700 text-white rounded-lg">Cancel</button>
              <button onClick={addService} className="flex-1 px-4 py-2.5 bg-white text-slate-900 rounded-lg font-medium">Add Service</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
