import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth helper functions
export const signInWithEmail = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Database helper functions
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getTeamMembers = async (teamId) => {
  let query = supabase.from('profiles').select('*');
  if (teamId) {
    query = query.or(`primary_team.eq.${teamId},teams.cs.{${teamId}}`);
  }
  const { data, error } = await query.order('name');
  return { data, error };
};

export const getServices = async (teamId) => {
  let query = supabase.from('services').select('*');
  if (teamId) {
    query = query.eq('team_id', teamId);
  }
  const { data, error } = await query.order('date', { ascending: false });
  return { data, error };
};

export const getEquipment = async (teamId) => {
  let query = supabase.from('equipment').select('*');
  if (teamId) {
    query = query.eq('team_id', teamId);
  }
  const { data, error } = await query.order('name');
  return { data, error };
};

export const getAttendance = async (teamId) => {
  let query = supabase.from('attendance').select('*');
  if (teamId) {
    query = query.eq('team_id', teamId);
  }
  const { data, error } = await query.order('date', { ascending: false });
  return { data, error };
};

export const markAttendance = async (date, teamId, attendees) => {
  const { data, error } = await supabase
    .from('attendance')
    .upsert({ date, team_id: teamId, attendees }, { onConflict: 'date,team_id' })
    .select()
    .single();
  return { data, error };
};

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getDashboardStats = async (teamId) => {
  const [members, services, equipment, attendance] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }).or(`primary_team.eq.${teamId},teams.cs.{${teamId}}`),
    supabase.from('services').select('id', { count: 'exact' }).eq('team_id', teamId),
    supabase.from('equipment').select('id, status', { count: 'exact' }).eq('team_id', teamId),
    supabase.from('attendance').select('*').eq('team_id', teamId).order('date', { ascending: false }).limit(1)
  ]);

  const availableEquipment = equipment.data?.filter(e => e.status === 'available').length || 0;

  return {
    total_members: members.count || 0,
    total_services: services.count || 0,
    total_equipment: equipment.count || 0,
    available_equipment: availableEquipment,
    last_attendance: attendance.data?.[0] || null
  };
};

export default supabase;
