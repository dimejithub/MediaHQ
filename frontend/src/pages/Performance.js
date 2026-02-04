import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Performance() {
  const [metrics, setMetrics] = useState([]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/performance/metrics`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      toast.error('Failed to load performance metrics');
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="performance-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Performance Analytics</h1>
        <p className="text-base text-slate-600">Track team member reliability and attendance</p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <Card key={metric.user_id} data-testid={`metric-card-${metric.user_id}`}>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-semibold mb-1">{metric.name}</h3>
                  <span className="text-sm text-muted-foreground capitalize">{metric.role}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-heading font-bold text-primary">{metric.total_assignments}</div>
                    <div className="text-xs text-muted-foreground mt-1">Total Assignments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-heading font-bold text-green-600">{metric.confirmed}</div>
                    <div className="text-xs text-muted-foreground mt-1">Confirmed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-heading font-bold text-yellow-600">{metric.pending}</div>
                    <div className="text-xs text-muted-foreground mt-1">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-heading font-bold text-red-600">{metric.declined}</div>
                    <div className="text-xs text-muted-foreground mt-1">Declined</div>
                  </div>
                  <div className="text-center col-span-2 md:col-span-1">
                    <div className="text-2xl font-heading font-bold text-accent flex items-center justify-center gap-1">
                      {metric.attendance_rate}%
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Attendance Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {metrics.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No performance data available</p>
        </div>
      )}
    </div>
  );
}