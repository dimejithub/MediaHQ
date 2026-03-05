-- TEN MediaHQ Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- TEAMS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default teams
INSERT INTO teams (team_id, name, description) VALUES
    ('envoy_nation', 'Envoy Nation', 'Main church media team'),
    ('e_nation', 'E-Nation (TCE)', 'The Commissioned Envoy team')
ON CONFLICT (team_id) DO NOTHING;

-- =====================
-- USERS/PROFILES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id TEXT UNIQUE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    phone TEXT,
    primary_team TEXT REFERENCES teams(team_id),
    teams TEXT[] DEFAULT ARRAY['envoy_nation'],
    unit TEXT,
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    availability TEXT DEFAULT 'available',
    profile_picture_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_primary_team ON profiles(primary_team);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =====================
-- SERVICES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id TEXT UNIQUE DEFAULT 'svc_' || substr(md5(random()::text), 1, 12),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL,
    team_id TEXT REFERENCES teams(team_id),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_team ON services(team_id);
CREATE INDEX IF NOT EXISTS idx_services_date ON services(date);

-- =====================
-- EQUIPMENT TABLE
-- =====================
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id TEXT UNIQUE DEFAULT 'equip_' || substr(md5(random()::text), 1, 12),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    team_id TEXT REFERENCES teams(team_id),
    checked_out_by TEXT,
    checked_out_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_team ON equipment(team_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);

-- =====================
-- ATTENDANCE TABLE
-- =====================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    team_id TEXT REFERENCES teams(team_id),
    attendees TEXT[] DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, team_id)
);

CREATE INDEX IF NOT EXISTS idx_attendance_team ON attendance(team_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);

-- =====================
-- ROTAS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS rotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id TEXT REFERENCES services(service_id),
    team_id TEXT REFERENCES teams(team_id),
    assignments JSONB DEFAULT '[]'::JSONB,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rotas_service ON rotas(service_id);
CREATE INDEX IF NOT EXISTS idx_rotas_team ON rotas(team_id);

-- =====================
-- NOTIFICATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- =====================
-- CHECKLISTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id TEXT REFERENCES services(service_id),
    team_id TEXT REFERENCES teams(team_id),
    items JSONB DEFAULT '[]'::JSONB,
    completed_by TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ROW LEVEL SECURITY (RLS)
-- =====================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can view team services" ON services FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage services" ON services FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
);

CREATE POLICY "Users can view equipment" ON equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage equipment" ON equipment FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
);

CREATE POLICY "Users can view attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage attendance" ON attendance FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead', 'unit_head'))
);

CREATE POLICY "Users can view rotas" ON rotas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage rotas" ON rotas FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = (SELECT user_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE TO authenticated USING (user_id = (SELECT user_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Users can view checklists" ON checklists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage checklists" ON checklists FOR ALL TO authenticated USING (true);

-- =====================
-- FUNCTIONS
-- =====================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, user_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'user_' || substr(md5(NEW.id::text), 1, 8)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================
-- SEED DATA - TEAM MEMBERS
-- =====================
-- Note: These will be created when users sign up via Supabase Auth
-- The profiles table will be populated automatically

COMMENT ON TABLE profiles IS 'User profiles linked to Supabase Auth';
COMMENT ON TABLE services IS 'Church services schedule';
COMMENT ON TABLE equipment IS 'Media equipment inventory';
COMMENT ON TABLE attendance IS 'Tuesday standup attendance records';
COMMENT ON TABLE rotas IS 'Service duty assignments';
