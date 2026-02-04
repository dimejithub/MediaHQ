import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/services`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Services</h1>
      <p className="text-gray-600 mb-8">Schedule and manage church services</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, idx) => (
          <div key={idx} className="bg-white border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">{service.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{service.description || 'No description'}</p>
            <div className="space-y-2">
              <p className="text-sm"><span className="font-semibold">Date:</span> {service.date}</p>
              <p className="text-sm"><span className="font-semibold">Time:</span> {service.time}</p>
              <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{service.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}