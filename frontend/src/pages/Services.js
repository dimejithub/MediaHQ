import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Services() {
  const { demoMode, user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({ title: '', date: '', time: '', type: 'sunday_service', description: '' });

  const serviceTypes = ['sunday_service', 'worship_night', 'youth_service', 'special_event', 'conference'];

  const demoServices = [
    { service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00', type: 'sunday_service', description: 'Main weekly worship service' },
    { service_id: 'demo_2', title: 'Worship Night', date: '2026-02-12', time: '19:00', type: 'worship_night', description: 'Evening worship and prayer' },
    { service_id: 'demo_3', title: 'Youth Service', date: '2026-02-14', time: '18:00', type: 'youth_service', description: 'Youth ministry gathering' }
  ];

  useEffect(() => {
    if (demoMode) {
      setServices(demoServices);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/services`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setServices(data.length > 0 ? data : demoServices);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setServices(demoServices);
        setLoading(false);
      });
  }, [demoMode]);

  const handleAddService = async () => {
    if (!newService.title || !newService.date || !newService.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (demoMode) {
      const newItem = {
        service_id: `demo_${Date.now()}`,
        ...newService
      };
      setServices([newItem, ...services]);
      setNewService({ title: '', date: '', time: '', type: 'sunday_service', description: '' });
      setShowAddModal(false);
      toast.success('Service scheduled');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newService)
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

  const isAdmin = user?.role === 'admin' || user?.role === 'team_lead';

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
          <h1 className="text-4xl font-bold text-white mb-2">Services</h1>
          <p className="text-slate-400">Schedule and manage church services</p>
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
        {services.map((service) => (
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
              <span className="inline-block px-3 py-1 text-xs bg-slate-800 text-slate-300 rounded-full capitalize">{service.type?.replace('_', ' ')}</span>
            </div>
          </div>
        ))}
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
                  onChange={(e) => setNewService({ ...newService, type: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white"
                  data-testid="service-type-select"
                >
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
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