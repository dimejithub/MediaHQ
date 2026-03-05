-- TEN MediaHQ Seed Data (Safe Version)
-- Run this in Supabase SQL Editor AFTER the schema has been created
-- (Dashboard → SQL Editor → New Query → Paste & Run)

-- =====================
-- SEED SERVICES
-- =====================
INSERT INTO services (service_id, title, date, time, type, team_id, description) VALUES
    ('svc_sunday_main', 'Sunday Morning Service', '2026-02-08', '11:00', 'sunday_service', 'envoy_nation', 'Main Sunday worship service'),
    ('svc_sunday_tce', 'The Commissioned Envoy Service', '2026-02-08', '14:00', 'sunday_service', 'e_nation', 'TCE afternoon service'),
    ('svc_midweek', 'Midweek Leicester Blessings', '2026-02-11', '18:30', 'midweek', 'envoy_nation', 'Wednesday midweek service'),
    ('svc_tuesday', 'Tuesday Standup Meeting', '2026-02-10', '20:00', 'standup', 'envoy_nation', 'Weekly team standup'),
    ('svc_rehearsal', 'Technical Rehearsal', '2026-02-07', '17:00', 'rehearsal', 'envoy_nation', 'Equipment and tech rehearsal')
ON CONFLICT (service_id) DO NOTHING;

-- =====================
-- SEED EQUIPMENT
-- =====================
INSERT INTO equipment (equipment_id, name, category, status, team_id, notes, checked_out_by) VALUES
    ('equip_001', 'Sony PTZ Camera 1', 'camera', 'available', 'envoy_nation', 'Main pulpit camera', NULL),
    ('equip_002', 'Sony PTZ Camera 2', 'camera', 'available', 'envoy_nation', 'Wide angle camera', NULL),
    ('equip_003', 'Blackmagic ATEM Mini Pro', 'video_switcher', 'available', 'envoy_nation', 'Main video switcher', NULL),
    ('equip_004', 'Shure SM58 Microphone', 'audio', 'checked_out', 'envoy_nation', 'Handheld mic', 'user_gabriel'),
    ('equip_005', 'Behringer X32 Mixer', 'audio', 'available', 'envoy_nation', 'Main audio mixer', NULL),
    ('equip_006', 'MacBook Pro M2', 'computer', 'checked_out', 'envoy_nation', 'Livestream computer', 'user_joshua')
ON CONFLICT (equipment_id) DO NOTHING;

-- =====================
-- SEED SAMPLE ROTAS
-- =====================
INSERT INTO rotas (service_id, team_id, assignments, status) VALUES
    ('svc_sunday_main', 'envoy_nation', '[
        {"role": "Camera 1", "assigned_to": "user_jasper", "name": "Jasper Eromon", "status": "confirmed"},
        {"role": "Camera 2", "assigned_to": "user_emmanuel", "name": "Emmanuel Adeyemi", "status": "confirmed"},
        {"role": "Sound", "assigned_to": "user_gabriel", "name": "Gabriel Oladipo", "status": "pending"},
        {"role": "Livestream", "assigned_to": "user_joshua", "name": "Joshua Awojide", "status": "confirmed"},
        {"role": "Graphics", "assigned_to": "user_boluwatife", "name": "Boluwatife Akinola", "status": "pending"},
        {"role": "Lighting", "assigned_to": "user_samuel", "name": "Samuel Okonkwo", "status": "confirmed"}
    ]'::jsonb, 'published'),
    ('svc_sunday_tce', 'e_nation', '[
        {"role": "Camera", "assigned_to": "user_daniel", "name": "Daniel Amaechi", "status": "confirmed"},
        {"role": "Sound", "assigned_to": "user_matthew", "name": "Matthew Ikenna", "status": "pending"},
        {"role": "Livestream", "assigned_to": "user_mark", "name": "Mark Chibueze", "status": "confirmed"}
    ]'::jsonb, 'published'),
    ('svc_midweek', 'envoy_nation', '[
        {"role": "Camera 1", "assigned_to": "user_peter", "name": "Peter Adeleke", "status": "pending"},
        {"role": "Sound", "assigned_to": "user_john", "name": "John Okafor", "status": "pending"},
        {"role": "Livestream", "assigned_to": "user_michael", "name": "Michael Eze", "status": "pending"}
    ]'::jsonb, 'draft');

-- =====================
-- SEED ATTENDANCE
-- =====================
INSERT INTO attendance (date, team_id, attendees, notes) VALUES
    ('2026-02-01', 'envoy_nation', ARRAY['user_adebowale', 'user_adeola', 'user_oladimeji', 'user_michel', 'user_jasper', 'user_gabriel', 'user_joshua', 'user_boluwatife', 'user_damilola', 'user_emmanuel', 'user_david', 'user_samuel', 'user_peter'], 'Good turnout for standup'),
    ('2026-02-08', 'envoy_nation', ARRAY['user_adebowale', 'user_adeola', 'user_oladimeji', 'user_oluseye', 'user_oladipupo', 'user_jasper', 'user_gabriel', 'user_joshua', 'user_boluwatife', 'user_damilola', 'user_emmanuel', 'user_david', 'user_samuel', 'user_peter', 'user_john', 'user_michael', 'user_andrew', 'user_philip', 'user_stephen'], 'Full team present')
ON CONFLICT (date, team_id) DO NOTHING;

-- =====================
-- SEED CHECKLISTS
-- =====================
INSERT INTO checklists (service_id, team_id, items) VALUES
    ('svc_sunday_main', 'envoy_nation', '[
        {"id": "chk_1", "text": "Test all cameras and PTZ controls", "checked": false, "category": "camera"},
        {"id": "chk_2", "text": "Check audio levels and mic batteries", "checked": false, "category": "audio"},
        {"id": "chk_3", "text": "Start livestream software and test connection", "checked": false, "category": "livestream"},
        {"id": "chk_4", "text": "Load ProPresenter slides for service", "checked": false, "category": "graphics"},
        {"id": "chk_5", "text": "Test stage lighting presets", "checked": false, "category": "lighting"},
        {"id": "chk_6", "text": "Confirm all rota members are present", "checked": false, "category": "general"},
        {"id": "chk_7", "text": "Set recording destinations and check storage", "checked": false, "category": "recording"},
        {"id": "chk_8", "text": "Test video switcher transitions", "checked": false, "category": "video"}
    ]'::jsonb);

-- =====================
-- SEED NOTIFICATIONS (generic, not tied to profiles)
-- =====================
INSERT INTO notifications (user_id, title, message, type, read) VALUES
    ('user_adebowale', 'Welcome to TEN MediaHQ', 'Your church media management platform is ready.', 'info', false),
    ('user_adebowale', 'New Rota Published', 'Sunday Morning Service rota has been published. Check your assignments.', 'rota', false),
    ('user_jasper', 'Rota Assignment', 'You have been assigned Camera 1 for Sunday Morning Service on Feb 8.', 'rota', false),
    ('user_gabriel', 'Equipment Reminder', 'You currently have Shure SM58 Microphone checked out. Please return after service.', 'equipment', false),
    ('user_joshua', 'Equipment Reminder', 'You currently have MacBook Pro M2 checked out. Please return after service.', 'equipment', false);

-- =====================
-- ADD RLS INSERT POLICIES
-- =====================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Admins can insert services') THEN
        CREATE POLICY "Admins can insert services" ON services FOR INSERT TO authenticated WITH CHECK (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'equipment' AND policyname = 'Admins can insert equipment') THEN
        CREATE POLICY "Admins can insert equipment" ON equipment FOR INSERT TO authenticated WITH CHECK (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Admins can insert attendance') THEN
        CREATE POLICY "Admins can insert attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead', 'unit_head'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rotas' AND policyname = 'Admins can insert rotas') THEN
        CREATE POLICY "Admins can insert rotas" ON rotas FOR INSERT TO authenticated WITH CHECK (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'System can insert notifications') THEN
        CREATE POLICY "System can insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checklists' AND policyname = 'Users can insert checklists') THEN
        CREATE POLICY "Users can insert checklists" ON checklists FOR INSERT TO authenticated WITH CHECK (true);
    END IF;
END $$;
