import { useState } from 'react';
import { useAuth } from '../App';

const TRAINING_MODULES = [
  {
    id: 1,
    title: 'Camera Operations Basics',
    category: 'Production',
    description: 'Learn PTZ controls, manual camera handling, and shot composition for church services.',
    duration: '45 min',
    level: 'Beginner',
    link: 'https://docs.google.com/document/d/camera-ops-basics',
  },
  {
    id: 2,
    title: 'Live Switching & Transitions',
    category: 'Production',
    description: 'Master the video switcher: cuts, dissolves, and picture-in-picture for live production.',
    duration: '30 min',
    level: 'Intermediate',
    link: 'https://docs.google.com/document/d/live-switching',
  },
  {
    id: 3,
    title: 'Livestream Setup & Troubleshooting',
    category: 'Projection & Livestream',
    description: 'OBS/StreamYard setup, bitrate settings, and common livestream issues.',
    duration: '60 min',
    level: 'Intermediate',
    link: 'https://docs.google.com/document/d/livestream-setup',
  },
  {
    id: 4,
    title: 'ProPresenter / Slides',
    category: 'Projection & Livestream',
    description: 'Creating slides, managing lyrics, lower-thirds, and video cues for projection.',
    duration: '40 min',
    level: 'Beginner',
    link: 'https://docs.google.com/document/d/slides',
  },
  {
    id: 5,
    title: 'Photography for Church Events',
    category: 'Photography',
    description: 'Composition, lighting tips, and camera settings for capturing church moments.',
    duration: '35 min',
    level: 'Beginner',
    link: 'https://docs.google.com/document/d/photography',
  },
  {
    id: 6,
    title: 'Video Editing Workflow',
    category: 'Post-Production',
    description: 'Editing sermon clips, highlight reels, and social media content.',
    duration: '50 min',
    level: 'Intermediate',
    link: 'https://docs.google.com/document/d/video-editing',
  },
  {
    id: 7,
    title: 'Audio & Sound Basics',
    category: 'Production',
    description: 'Microphone types, mixing board basics, and audio troubleshooting for services.',
    duration: '40 min',
    level: 'Beginner',
    link: 'https://docs.google.com/document/d/audio-basics',
  },
  {
    id: 8,
    title: 'Social Media Content Strategy',
    category: 'Post-Production',
    description: 'Creating engaging social media content from service recordings and photos.',
    duration: '25 min',
    level: 'Beginner',
    link: 'https://docs.google.com/document/d/social-media',
  },
];

export default function Training() {
  const { demoMode } = useAuth();
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  const categories = ['all', ...new Set(TRAINING_MODULES.map(m => m.category))];
  const filtered = TRAINING_MODULES.filter(m =>
    (filterCategory === 'all' || m.category === filterCategory) &&
    (filterLevel === 'all' || m.level === filterLevel)
  );

  const getLevelColor = (level) => {
    if (level === 'Beginner') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (level === 'Intermediate') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getCategoryIcon = (cat) => {
    const icons = { 'Production': '🎬', 'Projection & Livestream': '📡', 'Photography': '📸', 'Post-Production': '🎞' };
    return icons[cat] || '📚';
  };

  return (
    <div className="space-y-6" data-testid="training-page">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Training Center</h1>
        <p className="text-slate-400 mt-1">{TRAINING_MODULES.length} training modules available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterCategory === cat ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat === 'all' ? 'All Units' : cat}
          </button>
        ))}
        <span className="border-l border-slate-700 mx-1" />
        {['all', 'Beginner', 'Intermediate'].map(lvl => (
          <button
            key={lvl}
            onClick={() => setFilterLevel(lvl)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterLevel === lvl ? 'bg-white text-slate-900' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {lvl === 'all' ? 'All Levels' : lvl}
          </button>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((module) => (
          <div key={module.id} className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl shrink-0">
                {getCategoryIcon(module.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium">{module.title}</h3>
                <p className="text-slate-500 text-xs mt-0.5">{module.category}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs border ${getLevelColor(module.level)}`}>
                {module.level}
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-3">{module.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-slate-500 text-xs">{module.duration}</span>
              <a
                href={demoMode ? '#' : module.link}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`training-link-${module.id}`}
                className="px-4 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-all border border-blue-500/30"
              >
                Open Training
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p className="text-4xl mb-3">📚</p>
          <p>No modules match your filters</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5">
        <p className="text-slate-400 text-sm">
          Training links open external documents (Google Docs/Drive). Contact your unit head to request access or suggest new training modules.
        </p>
      </div>
    </div>
  );
}
