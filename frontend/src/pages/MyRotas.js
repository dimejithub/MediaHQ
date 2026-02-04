import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function MyRotas() {
  const [rotas, setRotas] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/rotas/my-rotas`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setRotas(data))
      .catch(err => console.error(err));
  }, []);

  const handleConfirm = (rotaId, assignmentId, status) => {
    fetch(`${BACKEND_URL}/api/rotas/${rotaId}/assignments/${assignmentId}/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    }).then(() => window.location.reload());
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">My Rotas</h1>
      <p className="text-gray-600 mb-8">View and confirm your assignments</p>
      <div className="space-y-4">
        {rotas.map((rota, idx) => (
          <div key={idx} className="bg-white border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-2">{rota.service?.title || 'Service'}</h3>
            <p className="text-sm text-gray-600 mb-3">{rota.service?.date} at {rota.service?.time}</p>
            <div className="flex items-center gap-4">
              <span className="font-semibold">Your Role:</span>
              <span className="px-3 py-1 bg-gray-100 rounded">{rota.my_assignment?.role}</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                rota.my_assignment?.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                rota.my_assignment?.status === 'declined' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>{rota.my_assignment?.status}</span>
            </div>
            {rota.my_assignment?.status === 'pending' && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => handleConfirm(rota.rota_id, rota.my_assignment.assignment_id, 'confirmed')} className="px-4 py-2 bg-green-600 text-white rounded-md">Confirm</button>
                <button onClick={() => handleConfirm(rota.rota_id, rota.my_assignment.assignment_id, 'declined')} className="px-4 py-2 bg-red-600 text-white rounded-md">Decline</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}