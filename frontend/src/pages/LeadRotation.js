import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function LeadRotation() {
  const [rotations, setRotations] = useState([]);
  const [year] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchRotations();
  }, []);

  const fetchRotations = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/lead-rotation?year=${year}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch rotations');
      const data = await response.json();
      setRotations(data);
    } catch (error) {
      toast.error('Failed to load lead rotation');
      console.error(error);
    }
  };

  const getWeekDateRange = (weekNumber, year) => {
    const firstDayOfYear = new Date(year, 0, 1);
    const daysOffset = (weekNumber - 1) * 7;
    const weekStart = new Date(firstDayOfYear.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="lead-rotation-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Lead Rotation Planner</h1>
        <p className="text-base text-slate-600">52-week leadership rotation schedule for {year}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 52 }, (_, i) => i + 1).map((weekNumber) => {
          const rotation = rotations.find((r) => r.week_number === weekNumber);
          return (
            <Card key={weekNumber} className="p-4" data-testid={`week-card-${weekNumber}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-lg font-heading font-semibold">Week {weekNumber}</h3>
                  <p className="text-xs text-muted-foreground">{getWeekDateRange(weekNumber, year)}</p>
                </div>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              {rotation ? (
                <div className="space-y-2 mt-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Lead:</span>
                    <div className="text-sm font-medium">Assigned</div>
                  </div>
                  {rotation.backup_user_id && (
                    <div>
                      <span className="text-xs text-muted-foreground">Backup:</span>
                      <div className="text-sm font-medium">Assigned</div>
                    </div>
                  )}
                  {rotation.notes && (
                    <p className="text-xs text-muted-foreground mt-2">{rotation.notes}</p>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground mt-3">Not scheduled</div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}