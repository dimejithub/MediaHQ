import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DEMO_SERVICES = [
  { service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' },
  { service_id: 'demo_2', title: 'Worship Night', date: '2026-02-12', time: '19:00' }
];

const DEMO_MEMBERS = [
  { user_id: 'demo_admin', name: 'John Smith' },
  { user_id: 'demo_lead', name: 'Sarah Johnson' },
  { user_id: 'demo_member1', name: 'Mike Wilson' },
  { user_id: 'demo_member2', name: 'Emily Brown' }
];

export default function ServiceReports() {
  const { demoMode } = useAuth();
  const [services, setServices] = useState([]);
  const [members, setMembers] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [report, setReport] = useState({ issues: '', equipment_status: '', improvements: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [demoMode]);

  const loadData = async () => {
    if (demoMode) {
      setServices(DEMO_SERVICES);
      setMembers(DEMO_MEMBERS);
      setSavedReports([]);
      setLoading(false);
      return;
    }

    try {
      const [servicesRes, membersRes, reportsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/services`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/team/members`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/reports`, { credentials: 'include' })
      ]);
      
      setServices(servicesRes.ok ? await servicesRes.json() : DEMO_SERVICES);
      setMembers(membersRes.ok ? await membersRes.json() : DEMO_MEMBERS);
      setSavedReports(reportsRes.ok ? await reportsRes.json() : []);
    } catch (err) {
      console.error(err);
      setServices(DEMO_SERVICES);
      setMembers(DEMO_MEMBERS);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendee = (userId) => {
    setAttendees(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const submitReport = async () => {
    if (!selectedService) return toast.error('Please select a service');
    if (attendees.length === 0) return toast.error('Please select at least one attendee');
    
    setSubmitting(true);

    if (demoMode) {
      const names = attendees.map(id => members.find(m => m.user_id === id)?.name).filter(Boolean);
      toast.success(`Report submitted for ${selectedService.title}! (${names.length} attendees)`);
      setReport({ issues: '', equipment_status: '', improvements: '' });
      setSelectedService(null);
      setAttendees([]);
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          service_id: selectedService.service_id,
          attendees: attendees,
          issues: report.issues,
          equipment_status: report.equipment_status,
          improvements: report.improvements
        })
      });

      if (res.ok) {
        toast.success('Report submitted successfully!');
        setReport({ issues: '', equipment_status: '', improvements: '' });
        setSelectedService(null);
        setAttendees([]);
        loadData();
      } else {
        toast.error('Failed to submit report');
      }
    } catch (err) {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading...</div></div>;

  return (
    <div className="p-8 space-y-6" data-testid="reports-page">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Service Reports</h1>
        <p className="text-slate-400">Document service performance and issues</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">📅 Select Service</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {services.map((service) => (
              <button key={service.service_id} onClick={() => setSelectedService(service)}
                className={`w-full text-left p-4 rounded-lg transition-all ${selectedService?.service_id === service.service_id ? 'bg-white text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}>
                <p className="font-bold">{service.title}</p>
                <p className="text-sm opacity-75">{service.date} at {service.time}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">📝 Report Form</h2>
          {selectedService ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <p className="font-bold text-white">{selectedService.title}</p>
                <p className="text-sm text-slate-400">{selectedService.date} at {selectedService.time}</p>
              </div>

              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <label className="block text-sm font-bold text-white mb-3">👥 Team Attendance</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {members.map((m) => (
                    <label key={m.user_id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer">
                      <input type="checkbox" checked={attendees.includes(m.user_id)} onChange={() => toggleAttendee(m.user_id)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-300">{m.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2">Selected: {attendees.length}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">⚠️ Issues & Challenges</label>
                <textarea value={report.issues} onChange={(e) => setReport({ ...report, issues: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" rows={3} placeholder="Document any issues..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">🛠️ Equipment Status</label>
                <textarea value={report.equipment_status} onChange={(e) => setReport({ ...report, equipment_status: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" rows={2} placeholder="Equipment needing attention..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">✨ What Went Well</label>
                <textarea value={report.improvements} onChange={(e) => setReport({ ...report, improvements: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" rows={2} placeholder="Wins and improvements..." />
              </div>

              <button onClick={submitReport} disabled={submitting} className="w-full px-6 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-100 transition-all disabled:opacity-50">
                {submitting ? '⏳ Submitting...' : '📤 Submit Report'}
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p className="text-6xl mb-4">👈</p>
              <p>Select a service to create a report</p>
            </div>
          )}
        </div>
      </div>

      {/* Saved Reports */}
      {savedReports.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
          <h2 className="text-lg font-bold text-white mb-4">📊 Previous Reports ({savedReports.length})</h2>
          <div className="space-y-3">
            {savedReports.slice(0, 5).map((r) => {
              const service = services.find(s => s.service_id === r.service_id);
              return (
                <div key={r.report_id} className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{service?.title || 'Unknown Service'}</p>
                      <p className="text-sm text-slate-400">{r.attendees?.length || 0} attendees</p>
                    </div>
                    <span className="text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.issues && <p className="text-sm text-slate-400 mt-2">Issues: {r.issues}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
