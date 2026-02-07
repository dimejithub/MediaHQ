import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Service type configurations with recurring patterns
const SERVICE_TYPES = {
  envoy_nation: [
    { value: 'sunday_service', label: 'Sunday Service', defaultTime: '11:00', day: 'Sunday', recurring: true },
    { value: 'midweek_service', label: 'Midweek Service (Leicester Blessings)', defaultTime: '19:00', day: 'Thursday', recurring: true },
    { value: 'connected_pmo', label: 'Connected with PMO', defaultTime: '19:00', day: 'Last Thursday', recurring: true },
    { value: 'tuesday_standup', label: 'Tuesday Standup Meeting', defaultTime: '19:00', day: 'Tuesday', recurring: true },
    { value: 'conference', label: 'Conference', defaultTime: '10:00', day: null, recurring: false },
    { value: 'bootcamp', label: 'Bootcamp', defaultTime: '09:00', day: null, recurring: false },
    { value: 'special_event', label: 'Special Event', defaultTime: '18:00', day: null, recurring: false }
  ],
  e_nation: [
    { value: 'sunday_service', label: 'Sunday Service (The Commissioned Envoy)', defaultTime: '14:00', day: 'Sunday', recurring: true },
    { value: 'midweek_service', label: 'Midweek Service', defaultTime: '19:00', day: 'Wednesday', recurring: true },
    { value: 'tuesday_standup', label: 'Tuesday Standup Meeting', defaultTime: '19:00', day: 'Tuesday', recurring: true },
    { value: 'conference', label: 'Conference', defaultTime: '10:00', day: null, recurring: false },
    { value: 'bootcamp', label: 'Bootcamp', defaultTime: '09:00', day: null, recurring: false },
    { value: 'special_event', label: 'Special Event', defaultTime: '18:00', day: null, recurring: false }
  ]
};

// Real team members for demo data
const REAL_MEMBERS = {
  envoy_nation: [
    { user_id: 'en_1', name: 'Dr. Adebowale Owoseni', role: 'director' },
    { user_id: 'en_2', name: 'Adeola Hilton', role: 'team_lead' },
    { user_id: 'en_3', name: 'Oladimeji Tiamiyu', role: 'assistant_lead' },
    { user_id: 'en_4', name: 'Michel Adimula', role: 'unit_head' },
    { user_id: 'en_5', name: 'Bro Oluseye', role: 'unit_head' }
  ],
  e_nation: [
    { user_id: 'e_1', name: 'David Lee', role: 'team_lead' },
    { user_id: 'e_2', name: 'Lisa Chen', role: 'assistant_lead' },
    { user_id: 'e_3', name: 'James Park', role: 'member' }
  ]
};

const DEMO_SERVICES = {
  envoy_nation: [
    { service_id: 'demo_en_1', title: 'Sunday Service', date: '2026-02-08', time: '11:00', type: 'sunday_service', description: 'Envoy Nation Sunday worship service', team: 'envoy_nation' },
    { service_id: 'demo_en_2', title: 'Midweek Service (Leicester Blessings)', date: '2026-02-12', time: '19:00', type: 'midweek_service', description: 'Thursday midweek service', team: 'envoy_nation' },
    { service_id: 'demo_en_3', title: 'Tuesday Standup', date: '2026-02-10', time: '19:00', type: 'tuesday_standup', description: 'Weekly team standup meeting - Attendance required', team: 'envoy_nation' },
    { service_id: 'demo_en_4', title: 'Connected with PMO', date: '2026-02-26', time: '19:00', type: 'connected_pmo', description: 'Last Thursday of the month fellowship', team: 'envoy_nation' },
    { service_id: 'demo_en_5', title: 'Sunday Service', date: '2026-02-15', time: '11:00', type: 'sunday_service', description: 'Envoy Nation Sunday worship service', team: 'envoy_nation' }
  ],
  e_nation: [
    { service_id: 'demo_e_1', title: 'The Commissioned Envoy', date: '2026-02-08', time: '14:00', type: 'sunday_service', description: 'E-Nation Sunday service', team: 'e_nation' },
    { service_id: 'demo_e_2', title: 'Midweek Service', date: '2026-02-11', time: '19:00', type: 'midweek_service', description: 'Wednesday midweek gathering', team: 'e_nation' },
    { service_id: 'demo_e_3', title: 'Tuesday Standup', date: '2026-02-10', time: '19:00', type: 'tuesday_standup', description: 'Weekly team standup meeting - Attendance required', team: 'e_nation' },
    { service_id: 'demo_e_4', title: 'The Commissioned Envoy', date: '2026-02-15', time: '14:00', type: 'sunday_service', description: 'E-Nation Sunday service', team: 'e_nation' }
  ]
};

export default function Services() {
  const { demoMode, user, selectedTeam } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateMonths, setGenerateMonths] = useState(3);
  const [generating, setGenerating] = useState(false);
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

  // Helper to get all dates for a specific day of week in a month range
  const getDatesForDayOfWeek = (dayOfWeek, startDate, endDate) => {
    const dates = [];
    const dayMap = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = dayMap[dayOfWeek];
    
    let current = new Date(startDate);
    current.setDate(current.getDate() + ((targetDay - current.getDay() + 7) % 7));
    
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    return dates;
  };

  // Get last Thursday of each month in range
  const getLastThursdays = (startDate, endDate) => {
    const dates = [];
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    
    while (current <= endDate) {
      const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      let thursday = new Date(lastDay);
      thursday.setDate(thursday.getDate() - ((thursday.getDay() + 3) % 7));
      if (thursday >= startDate && thursday <= endDate) {
        dates.push(thursday);
      }
      current.setMonth(current.getMonth() + 1);
    }
    return dates;
  };

  const generateRecurringServices = async () => {
    setGenerating(true);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + generateMonths);

    const newServices = [];
    const recurringTypes = serviceTypes.filter(t => t.recurring);

    for (const serviceType of recurringTypes) {
      let dates = [];
      
      if (serviceType.day === 'Last Thursday') {
        dates = getLastThursdays(startDate, endDate);
      } else if (serviceType.day) {
        dates = getDatesForDayOfWeek(serviceType.day, startDate, endDate);
      }

      for (const date of dates) {
        // Skip if Connected with PMO and it's not the last Thursday
        if (serviceType.value === 'connected_pmo') {
          // Already filtered by getLastThursdays
        } else if (serviceType.value === 'midweek_service' && selectedTeam === 'envoy_nation') {
          // Skip midweek on last Thursdays (that's Connected with PMO)
          const lastThursdays = getLastThursdays(startDate, endDate);
          if (lastThursdays.some(lt => lt.toDateString() === date.toDateString())) {
            continue;
          }
        }

        const dateStr = date.toISOString().split('T')[0];
        const title = serviceType.value === 'sunday_service' && selectedTeam === 'e_nation' 
          ? 'The Commissioned Envoy'
          : serviceType.value === 'midweek_service' && selectedTeam === 'envoy_nation'
            ? 'Midweek Service (Leicester Blessings)'
            : serviceType.label.replace(' (Leicester Blessings)', '').replace(' (The Commissioned Envoy)', '');

        newServices.push({
          service_id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title,
          date: dateStr,
          time: serviceType.defaultTime,
          type: serviceType.value,
          description: `${title} - Auto-generated`,
          team: selectedTeam
        });
      }
    }

    if (demoMode) {
      setServices(prev => [...newServices, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date)));
      toast.success(`Generated ${newServices.length} services for the next ${generateMonths} months`);
    } else {
      try {
        const res = await fetch(`${BACKEND_URL}/api/services/generate-recurring`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ team_id: selectedTeam, months: generateMonths, services: newServices })
        });
        
        if (res.ok) {
          const data = await res.json();
          setServices(prev => [...data.services, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date)));
          toast.success(`Generated ${data.count} services`);
        } else {
          // Fallback to local generation
          setServices(prev => [...newServices, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date)));
          toast.success(`Generated ${newServices.length} services`);
        }
      } catch (err) {
        setServices(prev => [...newServices, ...prev].sort((a, b) => new Date(a.date) - new Date(b.date)));
        toast.success(`Generated ${newServices.length} services`);
      }
    }

    setGenerating(false);
    setShowGenerateModal(false);
  };

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
    <div className="p-4 sm:p-6 lg:p-8" data-testid="services-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2">{teamDisplayName} Services</h1>
          <p className="text-slate-400 text-sm sm:text-base">Schedule and manage services for {teamDisplayName}</p>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowGenerateModal(true)}
              data-testid="generate-services-btn"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Generate Recurring
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              data-testid="add-service-btn"
              className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all"
            >
              + Schedule Service
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{services.length}</p>
          <p className="text-xs text-slate-400">Total Services</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-400">{services.filter(s => s.type === 'sunday_service').length}</p>
          <p className="text-xs text-slate-400">Sunday Services</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-green-400">{services.filter(s => s.type === 'midweek_service').length}</p>
          <p className="text-xs text-slate-400">Midweek Services</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-400">{services.filter(s => s.type === 'tuesday_standup').length}</p>
          <p className="text-xs text-slate-400">Standup Meetings</p>
        </div>
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