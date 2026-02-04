import { useEffect, useState } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function MyRotas() {
  const [rotas, setRotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRotas();
  }, []);

  const fetchMyRotas = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rotas/my-rotas`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch rotas');
      const data = await response.json();
      setRotas(data);
    } catch (error) {
      toast.error('Failed to load your rotas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (rotaId, assignmentId, status) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/rotas/${rotaId}/assignments/${assignmentId}/confirm`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update status');
      toast.success(`Status updated to ${status}`);
      fetchMyRotas();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading your rotas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="my-rotas-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">My Rotas</h1>
        <p className="text-base text-slate-600">View and confirm your scheduled assignments</p>
      </div>

      <div className="space-y-6">
        {rotas.map((rota) => (
          <Card key={rota.rota_id} className="hover:shadow-lg transition-shadow" data-testid={`rota-card-${rota.rota_id}`}>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-semibold mb-2">{rota.service?.title || 'Untitled Service'}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{rota.service?.date}</span>
                    </div>
                    <div>
                      <span>{rota.service?.time}</span>
                    </div>
                    <div>
                      <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-medium capitalize">
                        {rota.service?.type?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">Your Role:</span>
                    <span className="px-3 py-1 text-sm font-medium rounded-md bg-secondary text-secondary-foreground">
                      {rota.my_assignment?.role}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        rota.my_assignment?.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : rota.my_assignment?.status === 'declined'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {rota.my_assignment?.status}
                    </span>
                  </div>
                </div>

                {rota.my_assignment?.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleConfirm(rota.rota_id, rota.my_assignment.assignment_id, 'confirmed')}
                      data-testid={`confirm-rota-${rota.rota_id}`}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      onClick={() => handleConfirm(rota.rota_id, rota.my_assignment.assignment_id, 'declined')}
                      data-testid={`decline-rota-${rota.rota_id}`}
                      variant="destructive"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rotas.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No rotas assigned to you yet</p>
        </div>
      )}
    </div>
  );
}