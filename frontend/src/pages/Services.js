import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Services() {
  const { profile, demoMode } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    date: '',
    time: '',
    type: 'sunday_service',
    description: ''
  });

  const teamId = profile?.primary_team || 'envoy_nation';

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchServices(); }, [demoMode, teamId]);

  useEffect(() => {
    if (demoMode) return;
    const channel = supabase
      .channel('services-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
        fetchServices();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [demoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchServices = async () => {
    if (demoMode) {
      setServices([
        { id: '1', service_id: 'svc_1', title: 'Sunday Service', date: '2026-03-08', time: '11:00', type: 'sunday_service', team_id: 'envoy_nation' },
        { id: '2', service_id: 'svc_2', title: 'Leicester Blessing', date: '2026-03-05', time: '18:30', type: 'midweek', team_id: 'envoy_nation' },
        { id: '3', service_id: 'svc_3', title: 'Connected with PMO', date: '2026-03-26', time: '18:30', type: 'special', team_id: 'envoy_nation' },
        { id: '4', service_id: 'svc_4', title: 'Sunday Service', date: '2026-03-15', time: '11:00', type: 'sunday_service', team_id: 'envoy_nation' },
        { id: '5', service_id: 'svc_5', title: 'Leicester Blessing', date: '2026-03-12', time: '18:30', type: 'midweek', team_id: 'envoy_nation' },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Error fetching services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    
    if (demoMode) {
      const newSvc = {
        id: Date.now().toString(),
        service_id: `svc_${Date.now()}`,
        ...newService,
        team_id: teamId
      };
      setServices([...services, newSvc]);
      setShowAddModal(false);
      setNewService({ title: '', date: '', time: '', type: 'sunday_service', description: '' });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .insert([{ ...newService, team_id: teamId }])
        .select()
        .single();

      if (error) throw error;
      setServices([...services, data]);
      setShowAddModal(false);
      setNewService({ title: '', date: '', time: '', type: 'sunday_service', description: '' });
    } catch (err) {
      console.error('Error adding service:', err);
      alert('Failed to add service');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTypeBadge = (type) => {
    const badges = {
      sunday_service: { bg: 'bg-blue-500/20 text-blue-400', label: 'Sunday Service' },
      midweek: { bg: 'bg-green-500/20 text-green-400', label: 'Midweek' },
      standup: { bg: 'bg-purple-500/20 text-purple-400', label: 'Standup' },
      special: { bg: 'bg-orange-500/20 text-orange-400', label: 'Special' },
    };
    return badges[type] || badges.sunday_service;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Services</h1>
          <p className="text-slate-400 mt-1">{services.length} scheduled services</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
        >
          + Add Service
        </button>
      </div>

      {/* Services List */}
      {services.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-800 text-center">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-slate-400">No services scheduled</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
          >
            Schedule your first service
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id || service.service_id}
              className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                  {service.type === 'sunday_service' ? '⛪' : service.type === 'standup' ? '🎤' : '🙏'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium">{service.title}</h3>
                  <p className="text-slate-400 text-sm">{formatDate(service.date)} • {service.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(service.type).bg}`}>
                  {getTypeBadge(service.type).label}
                </span>
              </div>
              {service.description && (
                <p className="mt-3 text-slate-400 text-sm">{service.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-6">Add New Service</h2>
            <form onSubmit={handleAddService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                  <input
                    type="date"
                    value={newService.date}
                    onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                  <input
                    type="time"
                    value={newService.time}
                    onChange={(e) => setNewService({ ...newService, time: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                <select
                  value={newService.type}
                  onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                >
                  <option value="sunday_service">Sunday Service</option>
                  <option value="midweek">Midweek Service</option>
                  <option value="standup">Standup Meeting</option>
                  <option value="special">Special Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description (optional)</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white"
                  rows={3}
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
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
