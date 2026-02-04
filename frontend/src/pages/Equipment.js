import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/equipment`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setEquipment(data))
      .catch(err => console.error(err));
  }, []);

  const handleCheckout = (id) => {
    fetch(`${BACKEND_URL}/api/equipment/${id}/checkout`, { method: 'PUT', credentials: 'include' })
      .then(() => window.location.reload());
  };

  const handleCheckin = (id) => {
    fetch(`${BACKEND_URL}/api/equipment/${id}/checkin`, { method: 'PUT', credentials: 'include' })
      .then(() => window.location.reload());
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Equipment Inventory</h1>
      <p className="text-gray-600 mb-8">Track and manage media equipment</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {equipment.map((item, idx) => (
          <div key={idx} className="bg-white border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-3 capitalize">{item.category}</p>
            <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 ${
              item.status === 'available' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
            }`}>{item.status}</span>
            {item.notes && <p className="text-sm text-gray-600 mb-4">{item.notes}</p>}
            {item.status === 'available' ? (
              <button onClick={() => handleCheckout(item.equipment_id)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md">Check Out</button>
            ) : (
              <button onClick={() => handleCheckin(item.equipment_id)} className="w-full px-4 py-2 bg-gray-600 text-white rounded-md">Check In</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}