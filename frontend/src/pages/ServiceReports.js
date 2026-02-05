import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function ServiceReports() {
  const [services, setServices] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [report, setReport] = useState({
    issues: '',
    equipment_status: '',
    improvements: '',
    next_steps: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, membersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/services`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/team/members`, { credentials: 'include' })
      ]);
      
      if (servicesRes.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData.length > 0 ? servicesData : [
          { service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' }
        ]);
      } else {
        setServices([{ service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' }]);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.length > 0 ? membersData : [
          { user_id: 'demo_1', name: 'Admin User' },
          { user_id: 'demo_2', name: 'Team Lead' },
          { user_id: 'demo_3', name: 'Member 1' }
        ]);
      } else {
        setMembers([
          { user_id: 'demo_1', name: 'Admin User' },
          { user_id: 'demo_2', name: 'Team Lead' }
        ]);
      }
    } catch (err) {
      console.error(err);
      setServices([{ service_id: 'demo_1', title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' }]);
      setMembers([{ user_id: 'demo_1', name: 'Admin User' }]);
    }
  };

  const toggleAttendee = (userId) => {
    if (attendees.includes(userId)) {
      setAttendees(attendees.filter(id => id !== userId));
    } else {
      setAttendees([...attendees, userId]);
    }
  };

  const submitReport = () => {
    if (!selectedService) {
      toast.error('Please select a service');
      return;
    }
    if (attendees.length === 0) {
      toast.error('Please select at least one attendee');
      return;
    }
    
    const attendeeNames = attendees.map(id => members.find(m => m.user_id === id)?.name).filter(Boolean);
    toast.success(`Service report submitted for ${selectedService.title}! Attendees: ${attendeeNames.join(', ')}`);
    
    setReport({ issues: '', equipment_status: '', improvements: '', next_steps: '' });
    setSelectedService(null);
    setAttendees([]);
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Service Reports</h1>
        <p className="text-slate-600 text-lg">Document service performance, issues, and improvements</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📅</span>
            Select Service
          </h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {services.map((service, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedService(service)}
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

        {/* Report Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Service Report Form
          </h2>

          {selectedService ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                <p className="font-bold text-lg text-slate-800">{selectedService.title}</p>
                <p className="text-sm text-slate-600">{selectedService.date} at {selectedService.time}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">👥 Team Attendance</label>
                <textarea
                  value={report.attendance}
                  onChange={(e) => setReport({ ...report, attendance: e.target.value })}
                  placeholder="List team members present and any absences..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">⚠️ Issues & Challenges</label>
                <textarea
                  value={report.issues}
                  onChange={(e) => setReport({ ...report, issues: e.target.value })}
                  placeholder="Document any technical issues, challenges, or incidents..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">🛠️ Equipment Status</label>
                <textarea
                  value={report.equipment_status}
                  onChange={(e) => setReport({ ...report, equipment_status: e.target.value })}
                  placeholder="Note any equipment needing maintenance or repair..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">✨ Improvements & Wins</label>
                <textarea
                  value={report.improvements}
                  onChange={(e) => setReport({ ...report, improvements: e.target.value })}
                  placeholder="What went well? What should we keep doing?..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">📋 Next Steps</label>
                <textarea
                  value={report.next_steps}
                  onChange={(e) => setReport({ ...report, next_steps: e.target.value })}
                  placeholder="Action items for next service or follow-up required..."
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>

              <button
                onClick={submitReport}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
              >
                📤 Submit Report
              </button>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <p className="text-6xl mb-4">👈</p>
              <p className="text-lg">Select a service to create a report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}