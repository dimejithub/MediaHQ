import { useEffect, useState } from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Training() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/training/videos`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setVideos(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-2">Training Center</h1>
      <p className="text-gray-600 mb-8">Learn and develop your media production skills</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {videos.map((video, idx) => (
          <div key={idx} className="bg-white border rounded-lg p-6">
            <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-4xl">▶</div>
            <h3 className="text-lg font-bold mb-2">{video.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{video.description}</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{video.category}</span>
              {video.duration && <span className="text-xs text-gray-500">{video.duration}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}