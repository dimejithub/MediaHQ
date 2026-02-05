import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function MyRotas() {
  const { demoMode, user } = useAuth();
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoRotas = [
    { 
      rota_id: 'demo_rota_1', 
      service: { title: 'Sunday Morning Service', date: '2026-02-09', time: '10:00' },
      my_assignment: { assignment_id: 'demo_assign_1', role: 'Camera Operator', status: 'pending' }
    },
    { 
      rota_id: 'demo_rota_2', 
      service: { title: 'Worship Night', date: '2026-02-12', time: '19:00' },
      my_assignment: { assignment_id: 'demo_assign_2', role: 'Sound Engineer', status: 'confirmed' }
    }
  ];

  useEffect(() => {
    if (demoMode) {
      setRotas(demoRotas);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/rotas/my-rotas`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setRotas(data.length > 0 ? data : demoRotas);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setRotas(demoRotas);
        setLoading(false);
      });
  }, [demoMode]);

  const handleConfirm = async (rotaId, assignmentId, status) => {
    if (demoMode) {
      setRotas(rotas.map(r => 
        r.rota_id === rotaId 
          ? { ...r, my_assignment: { ...r.my_assignment, status } }
          : r
      ));
      toast.success(`Assignment ${status === 'confirmed' ? 'confirmed' : 'declined'}`);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/rotas/${rotaId}/assignments/${assignmentId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      
      if (res.ok) {
        setRotas(rotas.map(r => 
          r.rota_id === rotaId 
            ? { ...r, my_assignment: { ...r.my_assignment, status } }
            : r
        ));
        toast.success(`Assignment ${status === 'confirmed' ? 'confirmed' : 'declined'}`);
      }
    } catch (err) {
      toast.error('Failed to update assignment');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading your rotas...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="my-rotas-page">
      <h1 className="text-4xl font-bold text-white mb-2">My Rotas</h1>
      <p className="text-slate-400 mb-8">View and confirm your assignments</p>
      
      {rotas.length === 0 ? (
        <div className="bg-slate-900 rounded-xl p-12 text-center border border-slate-800">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-slate-400 text-lg">No rotas assigned yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rotas.map((rota) => (
            <div key={rota.rota_id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all" data-testid={`rota-${rota.rota_id}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{rota.service?.title || 'Service'}</h3>
                  <p className="text-sm text-slate-400">{rota.service?.date} at {rota.service?.time}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-sm text-slate-400">Your Role:</span>
                    <p className="font-medium text-white">{rota.my_assignment?.role}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    rota.my_assignment?.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                    rota.my_assignment?.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {rota.my_assignment?.status}
                  </span>
                </div>
              </div>
              {rota.my_assignment?.status === 'pending' && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-800">
                  <button 
                    onClick={() => handleConfirm(rota.rota_id, rota.my_assignment.assignment_id, 'confirmed')} 
                    data-testid={`confirm-${rota.rota_id}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all"
                  >
                    ✅ Confirm
                  </button>
                  <button 
                    onClick={() => handleConfirm(rota.rota_id, rota.my_assignment.assignment_id, 'declined')} 
                    data-testid={`decline-${rota.rota_id}`}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                  >
                    ❌ Decline
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}