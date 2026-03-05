import { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Checklists() {
  const { demoMode } = useAuth();
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChecklist, setActiveChecklist] = useState(null);

  useEffect(() => {
    fetchChecklists();
  }, [demoMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChecklists = async () => {
    if (demoMode) {
      setChecklists([
        {
          id: '1',
          title: 'Sunday Service Setup',
          service_date: '2026-03-08',
          items: [
            { id: 'i1', text: 'Test all microphones', checked: true },
            { id: 'i2', text: 'Check camera batteries', checked: true },
            { id: 'i3', text: 'Setup streaming software', checked: false },
            { id: 'i4', text: 'Test projector connection', checked: false },
            { id: 'i5', text: 'Sound check with worship team', checked: false },
          ]
        },
        {
          id: '2',
          title: 'Post-Service Checklist',
          service_date: '2026-03-08',
          items: [
            { id: 'i1', text: 'Backup recordings', checked: false },
            { id: 'i2', text: 'Return all equipment', checked: false },
            { id: 'i3', text: 'Power off all systems', checked: false },
            { id: 'i4', text: 'Lock media room', checked: false },
          ]
        },
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChecklists(data || []);
    } catch (err) {
      console.error('Error fetching checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (checklistId, itemId) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const updatedItems = checklist.items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );

    setChecklists(checklists.map(c =>
      c.id === checklistId ? { ...c, items: updatedItems } : c
    ));

    if (!demoMode) {
      try {
        await supabase
          .from('checklists')
          .update({ items: updatedItems })
          .eq('id', checklistId);
      } catch (err) {
        console.error('Error updating checklist:', err);
      }
    }
  };

  const getProgress = (checklist) => {
    const total = checklist.items?.length || 0;
    const completed = checklist.items?.filter(i => i.checked).length || 0;
    return { total, completed, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-white text-xl animate-pulse">Loading checklists...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Checklists</h1>
        <p className="text-slate-400 mt-1">Service preparation checklists</p>
      </div>

      {/* Checklists Grid */}
      {checklists.length === 0 ? (
        <div className="bg-slate-900/50 rounded-2xl p-12 border border-slate-800 text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-slate-400">No checklists available</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {checklists.map((checklist) => {
            const progress = getProgress(checklist);
            return (
              <div
                key={checklist.id}
                className="bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden"
              >
                {/* Checklist Header */}
                <div 
                  className="p-5 cursor-pointer hover:bg-slate-800/50 transition-all"
                  onClick={() => setActiveChecklist(activeChecklist === checklist.id ? null : checklist.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium">{checklist.title}</h3>
                      {checklist.service_date && (
                        <p className="text-slate-400 text-sm mt-1">
                          {new Date(checklist.service_date).toLocaleDateString('en-GB', { 
                            weekday: 'short', day: 'numeric', month: 'short' 
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        progress.percent === 100 ? 'bg-green-500/20 text-green-400' :
                        progress.percent > 50 ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      }`}>
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        progress.percent === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
                      }`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>

                {/* Checklist Items (Expandable) */}
                {activeChecklist === checklist.id && (
                  <div className="border-t border-slate-800 p-4 space-y-2">
                    {checklist.items?.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(checklist.id, item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                          item.checked 
                            ? 'bg-green-500/10 border border-green-500/30' 
                            : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          item.checked ? 'bg-green-500 border-green-500' : 'border-slate-500'
                        }`}>
                          {item.checked && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-left ${item.checked ? 'text-green-400 line-through' : 'text-white'}`}>
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
