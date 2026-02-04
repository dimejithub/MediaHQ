import { useEffect, useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Checklists() {
  const [checklists, setChecklists] = useState([]);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/checklists`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch checklists');
      const data = await response.json();
      setChecklists(data);
    } catch (error) {
      toast.error('Failed to load checklists');
      console.error(error);
    }
  };

  const toggleChecklistItem = async (checklistId, itemId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/checklists/${checklistId}/items/${itemId}/toggle`, {
        method: 'PUT',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to toggle item');
      loadChecklists();
    } catch (error) {
      toast.error('Failed to update item');
      console.error(error);
    }
  };

  const renderChecklistCard = (checklist) => {
    const completedCount = checklist.items.filter(i => i.completed).length;
    const totalCount = checklist.items.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
      <Card key={checklist.checklist_id} className="p-6" data-testid={`checklist-card-${checklist.checklist_id}`}>
        <div className="mb-4">
          <h3 className="text-xl font-heading font-semibold mb-2">{checklist.title}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{completedCount} of {totalCount} completed</span>
            <span className="text-xs">({Math.round(progress)}%)</span>
          </div>
          <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="space-y-3">
          {checklist.items.map(item => (
            <div key={item.item_id} className="flex items-start gap-3 p-3 rounded-md hover:bg-secondary/50" data-testid={`checklist-item-${item.item_id}`}>
              <Checkbox checked={item.completed} onCheckedChange={() => toggleChecklistItem(checklist.checklist_id, item.item_id)} data-testid={`checkbox-${item.item_id}`} />
              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}>{item.text}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="checklists-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Service Checklists</h1>
        <p className="text-base text-slate-600">Track service preparation tasks</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {checklists.map(checklist => renderChecklistCard(checklist))}
      </div>
      {checklists.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No checklists available</p>
        </div>
      )}
    </div>
  );
}