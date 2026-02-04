import { useEffect, useState } from 'react';
import { Play, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Training() {
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    fetchVideos();
    fetchProgress();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/training/videos`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch videos');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      toast.error('Failed to load training videos');
      console.error(error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/training/progress`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteVideo = async (videoId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/training/videos/${videoId}/complete`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark as complete');
      toast.success('Video marked as complete');
      fetchProgress();
      setSelectedVideo(null);
    } catch (error) {
      toast.error('Failed to update progress');
      console.error(error);
    }
  };

  const isVideoCompleted = (videoId) => {
    return progress.some((p) => p.video_id === videoId && p.completed);
  };

  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-testid="training-page">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Training Center</h1>
        <p className="text-base text-slate-600">Learn and develop your media production skills</p>
      </div>

      {selectedVideo && (
        <Card className="mb-8" data-testid="video-player-card">
          <CardContent className="pt-6">
            <div className="aspect-video mb-4">
              <iframe
                width="100%"
                height="100%"
                src={getYouTubeEmbedUrl(selectedVideo.youtube_url)}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-heading font-semibold mb-2">{selectedVideo.title}</h2>
                <p className="text-sm text-muted-foreground mb-2">{selectedVideo.description}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded-md capitalize">{selectedVideo.category}</span>
                  {selectedVideo.duration && <span>{selectedVideo.duration}</span>}
                </div>
              </div>
              <Button
                onClick={() => handleCompleteVideo(selectedVideo.video_id)}
                data-testid="mark-complete-btn"
                disabled={isVideoCompleted(selectedVideo.video_id)}
              >
                <Check className="h-4 w-4 mr-2" />
                {isVideoCompleted(selectedVideo.video_id) ? 'Completed' : 'Mark as Complete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const completed = isVideoCompleted(video.video_id);
          return (
            <Card
              key={video.video_id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedVideo(video)}
              data-testid={`video-card-${video.video_id}`}
            >
              <CardContent className="pt-6">
                <div className="relative aspect-video mb-4 bg-secondary rounded-lg overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${video.youtube_url.split('v=')[1] || video.youtube_url.split('/').pop()}/maxresdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  {completed && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white p-2 rounded-full">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-heading font-semibold mb-2">{video.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{video.description}</p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-accent/10 text-accent rounded-md capitalize">{video.category}</span>
                  {video.duration && <span>{video.duration}</span>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-12">
          <Play className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No training videos available</p>
        </div>
      )}
    </div>
  );
}