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
          title: 'Sunday Service Checklist',
          service_date: '2026-03-08',
          items: [
            { id: 'i1', text: 'Ensure all team members are present', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i2', text: 'Check the rota to ensure all unit members officiating are present, if yes tick and if no have reached out?', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i3', text: 'Assign specific roles and responsibilities', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i4', text: 'Turn on all sockets, media appliances, screens including LED screen', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i5', text: 'Inspect that all equipments are properly connected', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i6', text: 'Verify cameras, switchers, and monitors', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i7', text: 'Confirm HDMI cables are working', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i8', text: 'Check battery levels and replace if needed', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i9', text: 'Ensure proper camera angles and framing', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i10', text: 'Confirm pulpit camera is properly placed', checked: false, section: 'PRE-SERVICE SETUP' },
            { id: 'i11', text: 'Check communication headsets for clear audio', checked: false, section: 'TECHNICAL RUN-THROUGH' },
            { id: 'i12', text: 'Ensure livestream feed audio is clear', checked: false, section: 'TECHNICAL RUN-THROUGH' },
            { id: 'i13', text: 'Set up laptop/system for projection and livestream', checked: false, section: 'TECHNICAL RUN-THROUGH' },
            { id: 'i14', text: 'Download images/videos/lyrics from WhatsApp or Drive', checked: false, section: 'TECHNICAL RUN-THROUGH' },
            { id: 'i15', text: 'Verify slides, lyrics, and video cues', checked: false, section: 'TECHNICAL RUN-THROUGH' },
            { id: 'i16', text: 'Run short cue test for smooth transitions', checked: false, section: 'TECHNICAL RUN-THROUGH' },
            { id: 'i17', text: 'Start streaming 5 mins before service start time', checked: false, section: 'TECHNICAL RUN-THROUGH' },
            { id: 'i18', text: 'Confirm overlays/lower-thirds are working', checked: false, section: 'TECHNICAL RUN-THROUGH' },
            { id: 'i19', text: 'Ensure smooth camera switching and transitions', checked: false, section: 'LIVE PRODUCTION MONITORING' },
            { id: 'i20', text: 'Monitor video quality and adjust as needed', checked: false, section: 'LIVE PRODUCTION MONITORING' },
            { id: 'i21', text: 'Stay in sync with presentation and sound teams', checked: false, section: 'LIVE PRODUCTION MONITORING' },
            { id: 'i22', text: 'Be ready to troubleshoot issues quickly', checked: false, section: 'LIVE PRODUCTION MONITORING' },
            { id: 'i23', text: 'Document conflicts/challenges faced during service', checked: false, section: 'LIVE PRODUCTION MONITORING' },
            { id: 'i24', text: 'List all equipment collected after first service', checked: false, section: 'EQUIPMENT HANDOVER' },
            { id: 'i25', text: 'Ensure proper handover to second service team', checked: false, section: 'EQUIPMENT HANDOVER' },
            { id: 'i26', text: 'Second Service Lead signs off confirming equipment is intact', checked: false, section: 'EQUIPMENT HANDOVER' },
            { id: 'i27', text: 'Discuss what went well and issues faced', checked: false, section: 'DEBRIEF & FEEDBACK' },
            { id: 'i28', text: 'Note any equipment needing maintenance (to be done by sub unit head)', checked: false, section: 'DEBRIEF & FEEDBACK' },
            { id: 'i29', text: 'Plan improvements for the next service [during weekly standup]', checked: false, section: 'DEBRIEF & FEEDBACK' },
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
                  <div className="border-t border-slate-800 p-4 space-y-4">
                    {(() => {
                      const sections = {};
                      checklist.items?.forEach(item => {
                        const sec = item.section || 'General';
                        if (!sections[sec]) sections[sec] = [];
                        sections[sec].push(item);
                      });
                      return Object.entries(sections).map(([sectionName, items]) => (
                        <div key={sectionName}>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{sectionName}</p>
                          <div className="space-y-1">
                            {items.map((item) => (
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
                                <span className={`text-left text-sm ${item.checked ? 'text-green-400 line-through' : 'text-white'}`}>
                                  {item.text}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}
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
