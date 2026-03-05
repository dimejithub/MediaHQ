import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ServiceChecklists() {
  const [services, setServices] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, checklistsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/services`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/checklists`, { credentials: 'include' })
      ]);
      const servicesData = await servicesRes.json();
      const checklistsData = await checklistsRes.json();
      setServices(servicesData);
      setChecklists(checklistsData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const createChecklist = async (serviceId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/checklists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service_id: serviceId,
          title: 'Media Team Service Checklist',
          items: [
            // Pre-Service Setup
            { text: 'Ensure all team members are present' },
            { text: 'Check the rota to ensure all unit members officiating are present' },
            { text: 'Assign specific roles and responsibilities' },
            { text: 'Turn on all sockets, media appliances, screens including LED screen' },
            { text: 'Inspect that all equipments are properly connected' },
            { text: 'Verify cameras, switchers, and monitors' },
            { text: 'Confirm HDMI cables are working' },
            { text: 'Check battery levels and replace if needed' },
            { text: 'Ensure proper camera angles and framing' },
            { text: 'Confirm pulpit camera is properly placed' },
            // Technical Run-Through
            { text: 'Check communication headsets for clear audio' },
            { text: 'Ensure livestream feed audio is clear' },
            { text: 'Set up laptop/system for projection and livestream' },
            { text: 'Download images/videos/lyrics from WhatsApp or Drive' },
            { text: 'Verify slides, lyrics, and video cues' },
            { text: 'Run short cue test for smooth transitions' },
            { text: 'Start streaming 5 mins before service start time' },
            { text: 'Confirm overlays/lower-thirds are working' },
            // Live Production Monitoring
            { text: 'Ensure smooth camera switching and transitions' },
            { text: 'Monitor video quality and adjust as needed' },
            { text: 'Stay in sync with presentation and sound teams' },
            { text: 'Be ready to troubleshoot issues quickly' },
            { text: 'Document conflicts/challenges faced during service' },
            // Debrief & Feedback
            { text: 'Discuss what went well and issues faced' },
            { text: 'Note any equipment needing maintenance' },
            { text: 'Plan improvements for the next service' }
          ]
        })
      });
      if (!response.ok) throw new Error('Failed to create checklist');
      toast.success('Checklist created successfully!');
      loadData();
    } catch (err) {
      toast.error('Failed to create checklist');
      console.error(err);
    }
  };

  const toggleItem = async (checklistId, itemId) => {
    try {
      await fetch(`${BACKEND_URL}/api/checklists/${checklistId}/items/${itemId}/toggle`, {
        method: 'PUT',
        credentials: 'include'
      });
      loadData();
    } catch (err) {
      toast.error('Failed to update item');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-600 animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Service Checklists</h1>
        <p className="text-slate-600 text-lg">Pre-service setup, technical run-through, and post-service checklist</p>
      </div>

      {/* Services without checklists */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-3xl">📋</span>
          Create Checklist for Service
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, idx) => {
            const hasChecklist = checklists.find(c => c.service_id === service.service_id);
            if (hasChecklist) return null;
            
            return (
              <div key={idx} className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200">
                <h3 className="font-bold text-lg text-slate-800">{service.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{service.date} at {service.time}</p>
                <button
                  onClick={() => createChecklist(service.service_id)}
                  className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                >
                  ➕ Create Checklist
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Existing Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checklists.map((checklist, idx) => {
          const service = services.find(s => s.service_id === checklist.service_id);
          const completed = checklist.items.filter(i => i.completed).length;
          const total = checklist.items.length;
          const progress = (completed / total) * 100;

          const renderChecklistItems = () => {
            return checklist.items.map((item, itemIdx) => (
              <div key={itemIdx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => toggleItem(checklist.checklist_id, item.item_id)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                  {item.text}
                </span>
              </div>
            ));
          };

          return (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-800 mb-2">{service?.title || 'Service Checklist'}</h3>
                <p className="text-sm text-slate-600">{service?.date} at {service?.time}</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{completed}/{total}</span>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {renderChecklistItems()}
              </div>
            </div>
          );
        })}
      </div>

      {checklists.length === 0 && services.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <p className="text-6xl mb-4">📋</p>
          <p className="text-lg">No services scheduled yet. Create a service first!</p>
        </div>
      )}
    </div>
  );
}