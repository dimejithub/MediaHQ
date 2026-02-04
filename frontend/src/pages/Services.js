import { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Services() {
  const [services, setServices] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newService, setNewService] = useState({
    title: '',
    date: '',
    time: '',
    type: 'sunday_service',
    description: ''
  });

  useEffect(() => {
    fetchServices();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/services`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (error) {
      toast.error('Failed to load services');
      console.error(error);
    }
  };

  const handleCreateService = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newService)
      });
      if (!response.ok) throw new Error('Failed to create service');
      toast.success('Service created successfully');
      setShowCreateDialog(false);
      setNewService({ title: '', date: '', time: '', type: 'sunday_service', description: '' });
      fetchServices();
    } catch (error) {
      toast.error('Failed to create service');
      console.error(error);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/services/${serviceId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete service');
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error('Failed to delete service');
      console.error(error);
    }
  };

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'team_lead';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="services-page">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Services</h1>
          <p className="text-base text-slate-600">Schedule and manage church services and events</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateDialog(true)} data-testid="create-service-btn">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Service
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <Card key={service.service_id} className="hover:shadow-lg transition-shadow" data-testid={`service-card-${service.service_id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-semibold mb-1">{service.title}</h3>
                  <p className="text-sm text-muted-foreground">{service.description || 'No description'}</p>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteService(service.service_id)}
                    data-testid={`delete-service-${service.service_id}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{service.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Time:</span>
                  <span>{service.time}</span>
                </div>
                <div className="mt-3">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-accent/10 text-accent capitalize">
                    {service.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No services scheduled yet</p>
        </div>
      )}

      {/* Create Service Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="create-service-dialog">
          <DialogHeader>
            <DialogTitle>Schedule New Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newService.title}
                onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                data-testid="service-title-input"
                placeholder="Sunday Morning Service"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newService.date}
                  onChange={(e) => setNewService({ ...newService, date: e.target.value })}
                  data-testid="service-date-input"
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newService.time}
                  onChange={(e) => setNewService({ ...newService, time: e.target.value })}
                  data-testid="service-time-input"
                />
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newService.type}
                onValueChange={(value) => setNewService({ ...newService, type: value })}
              >
                <SelectTrigger data-testid="service-type-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday_service">Sunday Service</SelectItem>
                  <SelectItem value="worship_night">Worship Night</SelectItem>
                  <SelectItem value="special_event">Special Event</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="rehearsal">Rehearsal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                data-testid="service-description-input"
                placeholder="Optional service details..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCreateDialog(false)} data-testid="cancel-service-btn">
                Cancel
              </Button>
              <Button onClick={handleCreateService} data-testid="save-service-btn">
                Create Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}