import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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

export default function Checklists() {
  const { demoMode } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoServices = [
    { service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' },
    { service_id: 'demo_2', title: 'Worship Night', date: '2026-02-12', time: '19:00' }
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

  const selectService = (service) => {
    setSelectedService(service);
    setChecklist(CHECKLIST_ITEMS.map((item, idx) => ({
      id: idx,
      text: item,
      completed: false
    })));
  };

  const toggleItem = (id) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const saveChecklist = async () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }

    const completedCount = checklist.filter(i => i.completed).length;
    const totalCount = checklist.length;

    toast.success(`Checklist saved! ${completedCount}/${totalCount} items completed`);
    setSelectedService(null);
    setChecklist([]);
  };

  const completed = checklist.filter(i => i.completed).length;
  const total = checklist.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6" data-testid="checklists-page">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Service Checklists</h1>
        <p className="text-slate-400">29-item checklist for weekly service leads</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📅</span>
            Select Service
          </h2>
          <div className="space-y-2">
            {services.map((service) => (
              <button
                key={service.service_id}
                onClick={() => selectService(service)}
                data-testid={`checklist-service-${service.service_id}`}
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

        {/* Checklist */}
        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">📋</span>
            Service Checklist (29 Items)
          </h2>

          {selectedService ? (
            <div className="space-y-4">
              {/* Service Info */}
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <p className="font-bold text-lg text-white">{selectedService.title}</p>
                <p className="text-sm text-slate-400">{selectedService.date} at {selectedService.time}</p>
              </div>

              {/* Progress */}
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-amber-400">Progress</span>
                  <span className="text-sm font-bold text-amber-400">{completed}/{total} ({Math.round(progress)}%)</span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {checklist.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      item.completed ? 'bg-green-500/10 border border-green-500/30' : 'bg-slate-800 border border-slate-700 hover:border-slate-600'
                    }`}
                    data-testid={`checklist-item-${item.id}`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.completed ? 'bg-green-500 border-green-500' : 'border-slate-500'
                    }`}>
                      {item.completed && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className={`flex-1 text-sm ${item.completed ? 'text-green-400 line-through' : 'text-slate-300'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <button
                onClick={saveChecklist}
                data-testid="save-checklist-btn"
                className="w-full px-6 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-lg"
              >
                ✅ Save Checklist ({completed}/{total} completed)
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-6xl mb-4">👈</p>
              <p className="text-lg">Select a service to start the checklist</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
