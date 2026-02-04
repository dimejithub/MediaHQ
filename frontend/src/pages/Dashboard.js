import { useEffect, useState } from 'react';
import { Users, Calendar, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/dashboard/kpis`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      const data = await response.json();
      setKpis(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-base text-slate-600">Welcome to TEN MediaHQ - Your media operations command center</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-testid="kpi-team-members">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">{kpis?.total_members || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active volunteers</p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-services">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Services</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">{kpis?.total_services || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled events</p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-equipment">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Equipment</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">
              {kpis?.available_equipment || 0}/{kpis?.total_equipment || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for use</p>
          </CardContent>
        </Card>

        <Card data-testid="kpi-pending-rotas">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Confirmations</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold">{kpis?.pending_rotas || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" data-testid="upcoming-services-card">
          <CardHeader>
            <CardTitle className="text-xl font-heading font-semibold">Upcoming Services</CardTitle>
          </CardHeader>
          <CardContent>
            {kpis?.upcoming_services?.length > 0 ? (
              <div className="space-y-4">
                {kpis.upcoming_services.map((service) => (
                  <div
                    key={service.service_id}
                    className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                    data-testid={`service-${service.service_id}`}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-base">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{service.description || 'No description'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{service.date}</span>
                        <span>{service.time}</span>
                        <span className="px-2 py-1 rounded-full bg-accent/10 text-accent font-medium capitalize">
                          {service.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No upcoming services scheduled</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="quick-actions-card">
          <CardHeader>
            <CardTitle className="text-xl font-heading font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/services"
              data-testid="quick-action-schedule"
              className="block w-full px-4 py-3 bg-accent text-accent-foreground hover:bg-accent/90 rounded-md font-medium transition-colors text-center"
            >
              Schedule Service
            </a>
            <a
              href="/team"
              data-testid="quick-action-team"
              className="block w-full px-4 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium transition-colors text-center"
            >
              View Team
            </a>
            <a
              href="/equipment"
              data-testid="quick-action-equipment"
              className="block w-full px-4 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium transition-colors text-center"
            >
              Manage Equipment
            </a>
            <a
              href="/my-rotas"
              data-testid="quick-action-rotas"
              className="block w-full px-4 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium transition-colors text-center"
            >
              My Rotas
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}