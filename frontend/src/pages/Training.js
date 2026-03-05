import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DEMO_VIDEOS = [
  { video_id: 'demo_1', title: 'Camera Operation Basics', youtube_url: 'https://youtube.com/watch?v=example1', category: 'Camera', duration: '15:30', description: 'Learn the fundamentals of camera operation.' },
  { video_id: 'demo_2', title: 'Audio Mixing 101', youtube_url: 'https://youtube.com/watch?v=example2', category: 'Audio', duration: '22:45', description: 'Essential audio mixing techniques.' }
];

const DEMO_MATERIALS = [
  { material_id: 'demo_m1', title: 'Camera Operations Manual', url: 'https://drive.google.com/example1', type: 'pdf', category: 'Camera', description: 'Complete guide to camera operations' },
  { material_id: 'demo_m2', title: 'ProPresenter Quick Start', url: 'https://drive.google.com/example2', type: 'ppt', category: 'Software', description: 'Getting started with ProPresenter' }
];

function VideoCard({ video }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all">
      <div className="aspect-video bg-slate-800 flex items-center justify-center text-5xl cursor-pointer hover:bg-slate-700 transition-all">
        ▶️
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2">{video.title}</h3>
        <p className="text-sm text-slate-400 mb-3 line-clamp-2">{video.description}</p>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">{video.category}</span>
          {video.duration && <span className="text-xs text-slate-500">{video.duration}</span>}
        </div>
      </div>
    </div>
  );
}

function MaterialCard({ material, onDelete, isAdmin }) {
  const getTypeIcon = (type) => {
    switch(type) {
      case 'pdf': return '📄';
      case 'ppt': return '📊';
      case 'doc': return '📝';
      default: return '📁';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getTypeIcon(material.type)}</span>
          <div>
            <h3 className="font-bold text-white">{material.title}</h3>
            <p className="text-xs text-slate-400 uppercase">{material.type}</p>
          </div>
        </div>
        {isAdmin && onDelete && (
          <button onClick={() => onDelete(material.material_id)} className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
        )}
      </div>
      <p className="text-sm text-slate-400 mb-4">{material.description}</p>
      <div className="flex items-center justify-between">
        <span className="px-2 py-1 text-xs bg-slate-800 text-slate-300 rounded">{material.category}</span>
        <a href={material.url} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-sm bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-all">
          Open →
        </a>
      </div>
    </div>
  );
}

export default function Training() {
  const { demoMode, user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', type: 'pdf', category: 'General', description: '' });

  const isAdmin = user?.role === 'admin' || user?.role === 'team_lead';
  const categories = ['Camera', 'Audio', 'Lighting', 'Software', 'Livestream', 'General'];
  const materialTypes = ['pdf', 'ppt', 'doc', 'other'];

  useEffect(() => {
    loadData();
  }, [demoMode]);

  const loadData = async () => {
    if (demoMode) {
      setVideos(DEMO_VIDEOS);
      setMaterials(DEMO_MATERIALS);
      setLoading(false);
      return;
    }

    try {
      const [videosRes, materialsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/training/videos`, { credentials: 'include' }),
        fetch(`${BACKEND_URL}/api/training/materials`, { credentials: 'include' })
      ]);
      
      setVideos(videosRes.ok ? await videosRes.json() : DEMO_VIDEOS);
      setMaterials(materialsRes.ok ? await materialsRes.json() : DEMO_MATERIALS);
    } catch (err) {
      console.error(err);
      setVideos(DEMO_VIDEOS);
      setMaterials(DEMO_MATERIALS);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title || !newMaterial.url) {
      toast.error('Please fill in title and URL');
      return;
    }

    if (demoMode) {
      const newItem = { material_id: `demo_${Date.now()}`, ...newMaterial };
      setMaterials([...materials, newItem]);
      setNewMaterial({ title: '', url: '', type: 'pdf', category: 'General', description: '' });
      setShowAddModal(false);
      toast.success('Material added');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/training/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newMaterial)
      });
      
      if (res.ok) {
        const data = await res.json();
        setMaterials([...materials, data]);
        setNewMaterial({ title: '', url: '', type: 'pdf', category: 'General', description: '' });
        setShowAddModal(false);
        toast.success('Material added');
      }
    } catch (err) {
      toast.error('Failed to add material');
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (demoMode) {
      setMaterials(materials.filter(m => m.material_id !== materialId));
      toast.success('Material deleted');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/training/materials/${materialId}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setMaterials(materials.filter(m => m.material_id !== materialId));
        toast.success('Material deleted');
      }
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><div className="text-xl text-slate-400 animate-pulse">Loading...</div></div>;
  }

  return (
    <div className="p-8" data-testid="training-page">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Training Center</h1>
          <p className="text-slate-400">Videos and materials to develop your media skills</p>
        </div>
        {isAdmin && activeTab === 'materials' && (
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all">
            ➕ Add Material
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('videos')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'videos' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          🎬 Videos ({videos.length})
        </button>
        <button onClick={() => setActiveTab('materials')} className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'materials' ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          📚 Materials ({materials.length})
        </button>
      </div>

      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => <VideoCard key={video.video_id} video={video} />)}
          {videos.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <p className="text-5xl mb-4">🎬</p>
              <p>No training videos available</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'materials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <MaterialCard key={material.material_id} material={material} onDelete={handleDeleteMaterial} isAdmin={isAdmin} />
          ))}
          {materials.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <p className="text-5xl mb-4">📚</p>
              <p>No training materials available</p>
            </div>
          )}
        </div>
      )}

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Add Training Material</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title *</label>
                <input type="text" value={newMaterial.title} onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" placeholder="e.g., Camera Operations Manual" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">URL (Google Drive, Dropbox, etc.) *</label>
                <input type="url" value={newMaterial.url} onChange={(e) => setNewMaterial({ ...newMaterial, url: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" placeholder="https://drive.google.com/..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                  <select value={newMaterial.type} onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
                    {materialTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                  <select value={newMaterial.category} onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea value={newMaterial.description} onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white" rows={2} placeholder="Brief description..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all">Cancel</button>
              <button onClick={handleAddMaterial} className="flex-1 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-all">Add Material</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
