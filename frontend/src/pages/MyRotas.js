import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export default function MyRotas() {
  const { profile, demoMode } = useAuth();
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchRotas(); }, [demoMode]);

  const fetchRotas = async () => {
    if (demoMode) {
      setRotas([
        { 
          id: '1', 
          service: { title: 'Sunday Morning Service', date: '2026-03-08', time: '11:00' },
          role: 'Camera Operator',
          status: 'confirmed'
        },
        { 
          id: '2', 
          service: { title: 'Tuesday Standup', date: '2026-03-10', time: '20:00' },
          role: 'Sound Engineer',
          status: 'pending'
        },
        { 
          id: '3', 
          service: { title: 'Sunday Morning Service', date: '2026-03-15', time: '11:00' },
          role: 'Visuals',
          status: 'confirmed'
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('rotas')
        .select(`
          *,
          services (title, date, time)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match expected format
      const transformedData = (data || []).map(rota => {
        const myAssignment = rota.assignments?.find(
          a => a.user_id === profile?.user_id || a.user_id === profile?.id
        );
        return {
          id: rota.id,
          service: rota.services,
          role: myAssignment?.role || 'Team Member',
          status: myAssignment?.status || 'pending'
        };
      }).filter(r => r.service);

      setRotas(transformedData);
    } catch (err) {
      console.error('Error fetching rotas:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const handleAccept = (rotaId) => {
    setRotas(rotas.map(r => 
      r.id === rotaId ? { ...r, status: 'confirmed' } : r
    ));
  };

  const handleDecline = (rotaId) => {
    setRotas(rotas.map(r => 
      r.id === rotaId ? { ...r, status: 'declined' } : r
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading rotas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Rotas</h1>
          <p className="text-slate-400 mt-1">Your upcoming duty assignments</p>
        </div>
        {['director', 'team_lead', 'assistant_lead'].includes(profile?.role) && (
          <Link
            to="/assign-rotas"
            data-testid="assign-rotas-link"
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            + Assign Rotas
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{rotas.length}</p>
        </div>
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {rotas.filter(r => r.status === 'confirmed').length}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-orange-400 mt-1">
            {rotas.filter(r => r.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Rotas List */}
      {rotas.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-800 text-center">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-slate-400">No rotas assigned yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rotas.map((rota) => (
            <div
              key={rota.id}
              className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                    ⛪
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{rota.service?.title}</h3>
                    <p className="text-slate-400 text-sm">
                      {formatDate(rota.service?.date)} • {rota.service?.time}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  rota.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                  rota.status === 'declined' ? 'bg-red-500/20 text-red-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {rota.status}
                </span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Your Role</p>
                  <p className="text-white font-medium">{rota.role}</p>
                </div>
                
                {rota.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecline(rota.id)}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleAccept(rota.id)}
                      className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
