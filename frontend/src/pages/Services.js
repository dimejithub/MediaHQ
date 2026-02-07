import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Service type configurations
const SERVICE_TYPES = {
  envoy_nation: [
    { value: 'sunday_service', label: 'Sunday Service', defaultTime: '11:00', day: 'Sunday' },
    { value: 'leicester_blessings', label: 'Leicester Blessings', defaultTime: '19:00', day: 'Thursday' },
    { value: 'connected_pmo', label: 'Connected with PMO', defaultTime: '19:00', day: 'Last Thursday' },
    { value: 'conference', label: 'Conference', defaultTime: '10:00', day: null },
    { value: 'bootcamp', label: 'Bootcamp', defaultTime: '09:00', day: null },
    { value: 'special_event', label: 'Special Event', defaultTime: '18:00', day: null }
  ],
  e_nation: [
    { value: 'sunday_service', label: 'Sunday Service (Commissioned Envoy)', defaultTime: '14:00', day: 'Sunday' },
    { value: 'midweek_service', label: 'Midweek Service', defaultTime: '19:00', day: 'Wednesday' },
    { value: 'conference', label: 'Conference', defaultTime: '10:00', day: null },
    { value: 'bootcamp', label: 'Bootcamp', defaultTime: '09:00', day: null },
    { value: 'special_event', label: 'Special Event', defaultTime: '18:00', day: null }
  ]
};

const DEMO_SERVICES = {
  envoy_nation: [
    { service_id: 'demo_en_1', title: 'Sunday Service', date: '2026-02-08', time: '11:00', type: 'sunday_service', description: 'Envoy Nation Sunday worship service', team: 'envoy_nation' },
    { service_id: 'demo_en_2', title: 'Leicester Blessings', date: '2026-02-12', time: '19:00', type: 'leicester_blessings', description: 'Thursday midweek service', team: 'envoy_nation' },
    { service_id: 'demo_en_3', title: 'Connected with PMO', date: '2026-02-26', time: '19:00', type: 'connected_pmo', description: 'Last Thursday of the month fellowship', team: 'envoy_nation' },
    { service_id: 'demo_en_4', title: 'Sunday Service', date: '2026-02-15', time: '11:00', type: 'sunday_service', description: 'Envoy Nation Sunday worship service', team: 'envoy_nation' }
  ],
  e_nation: [
    { service_id: 'demo_e_1', title: 'The Commissioned Envoy', date: '2026-02-08', time: '14:00', type: 'sunday_service', description: 'E-Nation Sunday service', team: 'e_nation' },
    { service_id: 'demo_e_2', title: 'Midweek Service', date: '2026-02-11', time: '19:00', type: 'midweek_service', description: 'Wednesday midweek gathering', team: 'e_nation' },
    { service_id: 'demo_e_3', title: 'The Commissioned Envoy', date: '2026-02-15', time: '14:00', type: 'sunday_service', description: 'E-Nation Sunday service', team: 'e_nation' }
  ]
};

export default function Services() {
  const { demoMode, user, selectedTeam } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ title: '', date: '', time: '', type: 'sunday_service', description: '' });

  const serviceTypes = SERVICE_TYPES[selectedTeam] || SERVICE_TYPES.envoy_nation;
  const teamDisplayName = selectedTeam === 'envoy_nation' ? 'Envoy Nation' : 'The Commissioned Envoy (E-Nation)';

  useEffect(() => {
    const demoData = DEMO_SERVICES[selectedTeam] || DEMO_SERVICES.envoy_nation;
    
    if (demoMode) {
      setServices(demoData);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/services?team=${selectedTeam}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setServices(data.length > 0 ? data : demoData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setServices(demoData);
        setLoading(false);
      });
  }, [demoMode, selectedTeam]);

  const handleAddService = async () => {
    if (!newService.title || !newService.date || !newService.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (demoMode) {
      const newItem = {
        service_id: `demo_${Date.now()}`,
        ...newService,
        team: selectedTeam
      };
      setServices([newItem, ...services]);
      setNewService({ title: '', date: '', time: '', type: 'sunday_service', description: '' });
      setShowAddModal(false);
      toast.success(`Service scheduled for ${teamDisplayName}`);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...newService, team_id: selectedTeam })
      });
      
      if (res.ok) {
        const data = await res.json();
        setServices([data, ...services]);
        setNewService({ title: '', date: '', time: '', type: 'sunday_service', description: '' });
        setShowAddModal(false);
        toast.success('Service scheduled');
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      toast.error('Failed to create service');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'team_lead' || user?.role === 'director' || user?.role === 'assistant_lead';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="services-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">{teamDisplayName} Services</h1>
          <p className="text-slate-400">Schedule and manage services for {teamDisplayName}</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            data-testid="add-service-btn"
            className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
          >
            ➕ Schedule Service
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => {
          const typeInfo = serviceTypes.find(t => t.value === service.type);
          const typeLabel = typeInfo?.label || service.type?.replace('_', ' ');
          return (
            <div key={service.service_id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all" data-testid={`service-card-${service.service_id}`}>
              <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{service.description || 'No description'}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">📅</span>
                  <span className="text-slate-300">{service.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">🕐</span>
                  <span className="text-slate-300">{service.time}</span>
                </div>
                <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                  service.type === 'sunday_service' ? 'bg-blue-500/20 text-blue-400' :
                  service.type === 'leicester_blessings' ? 'bg-purple-500/20 text-purple-400' :
                  service.type === 'connected_pmo' ? 'bg-amber-500/20 text-amber-400' :
                  service.type === 'midweek_service' ? 'bg-green-500/20 text-green-400' :
                  service.type === 'conference' ? 'bg-pink-500/20 text-pink-400' :
                  service.type === 'bootcamp' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-slate-700 text-slate-300'
                }`}>{typeLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Schedule New Service</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Service Title *</label>
                <input
                  type="text"
                  value={newService.title}
                  onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  placeholder="e.g., Sunday Morning Service"
                  data-testid="service-title-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    value={newService.date}
                    onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    data-testid="service-date-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Time *</label>
                  <input
                    type="time"
                    value={newService.time}
                    onChange={(e) => setNewService({ ...newService, time: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                    data-testid="service-time-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                <select
                  value={newService.type}
                  onChange={(e) => {
                    const selectedType = serviceTypes.find(t => t.value === e.target.value);
                    setNewService({ 
                      ...newService, 
                      type: e.target.value,
                      time: selectedType?.defaultTime || newService.time
                    });
                  }}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  data-testid="service-type-select"
                >
                  {serviceTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} {type.day ? `(${type.day})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  rows={2}
                  placeholder="Optional description..."
                  data-testid="service-description-input"
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
                onClick={handleAddService}
                data-testid="confirm-add-service-btn"
                className="flex-1 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
              >
                Schedule Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}