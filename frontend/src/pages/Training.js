import { useEffect, useState } from 'react';
import { useAuth } from '@/App';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Training() {
  const { demoMode } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const demoVideos = [
    { video_id: 'demo_1', title: 'Camera Operation Basics', youtube_url: 'https://youtube.com/watch?v=example1', category: 'Camera', duration: '15:30', description: 'Learn the fundamentals of camera operation for church services.' },
    { video_id: 'demo_2', title: 'Audio Mixing 101', youtube_url: 'https://youtube.com/watch?v=example2', category: 'Audio', duration: '22:45', description: 'Essential audio mixing techniques for live church services.' },
    { video_id: 'demo_3', title: 'ProPresenter Tutorial', youtube_url: 'https://youtube.com/watch?v=example3', category: 'Software', duration: '30:00', description: 'Complete guide to using ProPresenter for worship presentations.' },
    { video_id: 'demo_4', title: 'Livestream Setup Guide', youtube_url: 'https://youtube.com/watch?v=example4', category: 'Livestream', duration: '18:20', description: 'How to set up and manage church livestreams.' }
  ];

  useEffect(() => {
    if (demoMode) {
      setVideos(demoVideos);
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/api/training/videos`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.json();
      })
      .then(data => {
        setVideos(data.length > 0 ? data : demoVideos);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setVideos(demoVideos);
        setLoading(false);
      });
  }, [demoMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl text-slate-400 animate-pulse">Loading training videos...</div>
      </div>
    );
  }

  return (
    <div className="p-8" data-testid="training-page">
      <h1 className="text-4xl font-bold text-white mb-2">Training Center</h1>
      <p className="text-slate-400 mb-8">Learn and develop your media production skills</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.video_id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all" data-testid={`video-${video.video_id}`}>
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
        ))}
      </div>
    </div>
  );
}