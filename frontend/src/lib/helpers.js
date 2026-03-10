import { supabase } from './supabase';

// Google Calendar URL generator
export function generateGoogleCalendarUrl(service) {
  const title = encodeURIComponent(service.title || 'Church Service');
  const date = service.date?.replace(/-/g, '');
  const time = service.time?.replace(':', '') + '00';
  const endTime = String(Number(service.time?.split(':')[0] || 11) + 2).padStart(2, '0') + (service.time?.split(':')[1] || '00') + '00';
  const details = encodeURIComponent(service.description || `${service.title} - TEN MediaHQ`);
  const location = encodeURIComponent('Church');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${date}T${time}/${date}T${endTime}&details=${details}&location=${location}`;
}

// CSV Export
export function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        let val = row[h];
        if (Array.isArray(val)) val = val.join('; ');
        if (val === null || val === undefined) val = '';
        val = String(val).replace(/"/g, '""');
        return `"${val}"`;
      }).join(',')
    )
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Activity Logger
export async function logActivity(action, details, userId) {
  try {
    await supabase.from('activity_logs').insert({
      action,
      details,
      user_id: userId,
    });
  } catch {
    // Silently fail if table doesn't exist yet
  }
}

// Upload profile photo to Supabase Storage
export async function uploadProfilePhoto(file, userId) {
  const ext = file.name.split('.').pop();
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage
    .from('profile-photos')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path);
  return urlData.publicUrl;
}
