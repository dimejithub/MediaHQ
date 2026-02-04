import { useEffect, useState } from 'react';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Equipment() {
  const [equipment, setEquipment] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [newEquipment, setNewEquipment] = useState({
    name: '',
    category: 'camera',
    notes: ''
  });

  useEffect(() => {
    fetchEquipment();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/me`, { credentials: 'include' });
      if (response.ok) setCurrentUser(await response.json());
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/equipment`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch equipment');
      const data = await response.json();
      setEquipment(data);
    } catch (error) {
      toast.error('Failed to load equipment');
      console.error(error);
    }
  };

  const handleCreateEquipment = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newEquipment)
      });
      if (!response.ok) throw new Error('Failed to create equipment');
      toast.success('Equipment added successfully');
      setShowCreateDialog(false);
      setNewEquipment({ name: '', category: 'camera', notes: '' });
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to add equipment');
      console.error(error);
    }
  };

  const handleCheckout = async (equipmentId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/equipment/${equipmentId}/checkout`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to checkout equipment');
      toast.success('Equipment checked out');
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to checkout equipment');
      console.error(error);
    }
  };

  const handleCheckin = async (equipmentId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/equipment/${equipmentId}/checkin`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to checkin equipment');
      toast.success('Equipment checked in');
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to checkin equipment');
      console.error(error);
    }
  };

  const handleDeleteEquipment = async (equipmentId) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/equipment/${equipmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete equipment');
      toast.success('Equipment deleted');
      fetchEquipment();
    } catch (error) {
      toast.error('Failed to delete equipment');
      console.error(error);
    }
  };

  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'team_lead';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="equipment-page">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Equipment Inventory</h1>
          <p className="text-base text-slate-600">Track and manage media equipment</p>
        </div>
        {canManage && (
          <Button onClick={() => setShowCreateDialog(true)} data-testid="add-equipment-btn">
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map((item) => (
          <Card key={item.equipment_id} className="hover:shadow-lg transition-shadow" data-testid={`equipment-card-${item.equipment_id}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-heading font-semibold mb-1">{item.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                </div>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEquipment(item.equipment_id)}
                    data-testid={`delete-equipment-${item.equipment_id}`}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                      item.status === 'available'
                        ? 'bg-blue-100 text-blue-800'
                        : item.status === 'checked_out'
                        ? 'bg-pink-100 text-pink-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-sm text-muted-foreground">{item.notes}</p>
                )}

                <div className="flex gap-2 mt-4">
                  {item.status === 'available' ? (
                    <Button
                      size="sm"
                      onClick={() => handleCheckout(item.equipment_id)}
                      data-testid={`checkout-equipment-${item.equipment_id}`}
                      className="flex-1"
                    >
                      Check Out
                    </Button>
                  ) : item.status === 'checked_out' ? (
                    <Button
                      size="sm"
                      onClick={() => handleCheckin(item.equipment_id)}
                      data-testid={`checkin-equipment-${item.equipment_id}`}
                      variant="secondary"
                      className="flex-1"
                    >
                      Check In
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {equipment.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No equipment in inventory</p>
        </div>
      )}

      {/* Create Equipment Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent data-testid="create-equipment-dialog">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Equipment Name</Label>
              <Input
                value={newEquipment.name}
                onChange={(e) => setNewEquipment({ ...newEquipment, name: e.target.value })}
                data-testid="equipment-name-input"
                placeholder="Sony A7S III Camera"
              />
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newEquipment.category}
                onValueChange={(value) => setNewEquipment({ ...newEquipment, category: value })}
              >
                <SelectTrigger data-testid="equipment-category-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camera">Camera</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="lighting">Lighting</SelectItem>
                  <SelectItem value="computer">Computer</SelectItem>
                  <SelectItem value="cables">Cables</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={newEquipment.notes}
                onChange={(e) => setNewEquipment({ ...newEquipment, notes: e.target.value })}
                data-testid="equipment-notes-input"
                placeholder="Optional notes about the equipment..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowCreateDialog(false)} data-testid="cancel-equipment-btn">
                Cancel
              </Button>
              <Button onClick={handleCreateEquipment} data-testid="save-equipment-btn">
                Add Equipment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}