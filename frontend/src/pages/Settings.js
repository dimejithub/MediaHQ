import { useState } from 'react';
import { useAuth } from '../App';
import { supabase } from '../lib/supabase';

export default function Settings() {
  const { profile, setProfile, demoMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    unit: profile?.unit || '',
    availability: profile?.availability || 'available'
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (demoMode) {
      setProfile({ ...profile, ...formData });
      setMessage({ type: 'success', text: 'Profile updated (demo mode)' });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', profile?.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...formData });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      console.error('Error updating profile:', err);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-400 cursor-not-allowed"
            />
            <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
              placeholder="+44 7xxx xxx xxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Select Unit</option>
              <option value="Production">Production</option>
              <option value="Photography">Photography</option>
              <option value="Projection & Livestream">Projection & Livestream</option>
              <option value="Post-Production">Post-Production</option>
              <option value="Head">Head</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Availability</label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
            >
              <option value="available">Available</option>
              <option value="limited">Limited Availability</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Team Info */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Team Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-slate-400">Primary Team</span>
            <span className="text-white capitalize">{profile?.primary_team?.replace('_', ' ') || 'Envoy Nation'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Role</span>
            <span className="text-white capitalize">{profile?.role?.replace('_', ' ') || 'Member'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Teams</span>
            <span className="text-white">
              {(profile?.teams || ['envoy_nation']).map(t => t.replace('_', ' ')).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-slate-300">Email Notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-slate-300">WhatsApp Notifications</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500" />
          </label>
          <label className="flex items-center justify-between">
            <span className="text-slate-300">Rota Reminders</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-blue-500" />
          </label>
        </div>
      </div>

      {/* WhatsApp Integration */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">WhatsApp Integration</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
            <span className="text-2xl">💬</span>
            <div>
              <p className="text-green-400 font-medium text-sm">Connected</p>
              <p className="text-slate-400 text-xs">Rota notifications and reminders via WhatsApp</p>
            </div>
          </div>
          <p className="text-slate-500 text-xs">
            Team members with phone numbers will receive WhatsApp notifications for rota assignments, 
            equipment reminders, and service updates. Set your phone number above to receive messages.
          </p>
        </div>
      </div>
    </div>
  );
}
