import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/dashboard/kpis`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setKpis(data))
      .catch(err => console.error(err));
  }, []);

  if (!kpis) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-8">Welcome to TEN MediaHQ</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-sm text-gray-600 mb-2">Team Members</h3>
          <p className="text-3xl font-bold">{kpis.total_members || 0}</p>
        </div>
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-sm text-gray-600 mb-2">Services</h3>
          <p className="text-3xl font-bold">{kpis.total_services || 0}</p>
        </div>
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-sm text-gray-600 mb-2">Equipment</h3>
          <p className="text-3xl font-bold">{kpis.available_equipment || 0}/{kpis.total_equipment || 0}</p>
        </div>
        <div className="p-6 bg-white border rounded-lg">
          <h3 className="text-sm text-gray-600 mb-2">Pending Rotas</h3>
          <p className="text-3xl font-bold">{kpis.pending_rotas || 0}</p>
        </div>
      </div>
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Services</h2>
        {kpis.upcoming_services && kpis.upcoming_services.length > 0 ? (
          <div className="space-y-3">
            {kpis.upcoming_services.slice(0, 5).map((service, idx) => (
              <div key={idx} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{service.title}</h3>
                <p className="text-sm text-gray-600">{service.date} at {service.time}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming services</p>
        )}
      </div>
    </div>
  );
}