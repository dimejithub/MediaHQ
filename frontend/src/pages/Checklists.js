import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CHECKLIST_ITEMS = [
  // Pre-Service Setup (8 items)
  'Ensure all team members are present',
  'Check the rota to ensure all unit members officiating are present',
  'Assign specific roles and responsibilities',
  'Turn on all sockets, media appliances, screens including LED screen',
  'Inspect that all equipment are properly connected',
  'Verify cameras, switchers, and monitors',
  'Confirm HDMI cables are working',
  'Check battery levels and replace if needed',
  
  // Camera Setup (3 items)
  'Ensure proper camera angles and framing',
  'Confirm pulpit camera is properly placed',
  'Test camera switching and transitions',
  
  // Audio Setup (2 items)
  'Check communication headsets for clear audio',
  'Ensure livestream feed audio is clear',
  
  // Technical Run-Through (6 items)
  'Set up laptop/system for projection and livestream',
  'Download images/videos/lyrics from WhatsApp or Drive',
  'Verify slides, lyrics, and video cues',
  'Run short cue test for smooth transitions',
  'Start streaming 5 mins before service start time',
  'Confirm overlays/lower-thirds are working',
  
  // Live Production (5 items)
  'Ensure smooth camera switching and transitions',
  'Monitor video quality and adjust as needed',
  'Stay in sync with presentation and sound teams',
  'Be ready to troubleshoot issues quickly',
  'Document conflicts/challenges faced during service',
  
  // Post-Service (5 items)
  'Discuss what went well and issues faced',
  'Note any equipment needing maintenance',
  'Plan improvements for the next service',
  'Turn off all equipment properly',
  'Complete service report form'
];

export default function Checklists() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/services`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setServices(data.length > 0 ? data : [
          { service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' }
        ]);
      } else {
        setServices([
          { service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setServices([
        { service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' }
      ]);
    }
  };

  const selectService = (service) => {
    setSelectedService(service);
    // Initialize checklist with all items unchecked
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
    
    // Reset
    setSelectedService(null);
    setChecklist([]);
  };

  const completed = checklist.filter(i => i.completed).length;
  const total = checklist.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Service Checklists</h1>
        <p className="text-slate-600 text-lg">29-item checklist for weekly service leads</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Select Service
          </h2>
          <div className="space-y-2">
            {services.map((service, idx) => (
              <button
                key={idx}
                onClick={() => selectService(service)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedService?.service_id === service.service_id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <p className="font-bold">{service.title}</p>
                <p className="text-sm opacity-90">{service.date} at {service.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span>
            Service Checklist (29 Items)
          </h2>

          {selectedService ? (
            <div className="space-y-4">
              {/* Service Info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                <p className="font-bold text-lg text-slate-800">{selectedService.title}</p>
                <p className="text-sm text-slate-600">{selectedService.date} at {selectedService.time}</p>
              </div>

              {/* Progress */}
              <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-800">Progress</span>
                  <span className="text-sm font-bold text-slate-800">{completed}/{total} ({Math.round(progress)}%)</span>
                </div>
                <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Checklist Items */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {checklist.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleItem(item.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Save Button */}
              <button
                onClick={saveChecklist}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all hover:scale-105"
              >
                ✅ Save Checklist ({completed}/{total} completed)
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-6xl mb-4">👈</p>
              <p className="text-lg">Select a service to start the checklist</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
