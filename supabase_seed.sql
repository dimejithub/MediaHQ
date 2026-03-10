-- TEN MediaHQ - REAL Seed Data (Envoy Nation)
-- Run in Supabase SQL Editor

-- CLEAR OLD FAKE DATA
DELETE FROM notifications;
DELETE FROM checklists;
DELETE FROM rotas;
DELETE FROM attendance;
DELETE FROM equipment;
DELETE FROM services;
DELETE FROM profiles WHERE id NOT IN (SELECT id FROM auth.users);

-- Allow profiles without auth link (Option C hybrid)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Update trigger to merge on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    existing_profile_id UUID;
BEGIN
    SELECT id INTO existing_profile_id FROM public.profiles WHERE email = NEW.email;
    IF existing_profile_id IS NOT NULL THEN
        UPDATE public.profiles SET
            id = NEW.id,
            email = NEW.email,
            name = COALESCE(NEW.raw_user_meta_data->>'name', profiles.name)
        WHERE id = existing_profile_id;
    ELSE
        INSERT INTO public.profiles (id, email, name, user_id, role, primary_team, teams)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
            'user_' || substr(md5(NEW.id::text), 1, 8),
            'member',
            'envoy_nation',
            ARRAY['envoy_nation']
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SEED TEAM MEMBERS
INSERT INTO profiles (id, user_id, email, name, role, primary_team, teams, unit, skills, availability, onboarding_completed)
VALUES
    (gen_random_uuid(), 'user_adebowale', 'adebowale@tenmediahq.com', 'Dr. Adebowale Owoseni', 'director', 'envoy_nation', ARRAY['envoy_nation'], 'Head', ARRAY['Leadership', 'Vision'], 'available', true),
    (gen_random_uuid(), 'user_adeola', 'adeola@tenmediahq.com', 'Adeola Hilton', 'team_lead', 'envoy_nation', ARRAY['envoy_nation'], 'Lead', ARRAY['Leadership', 'Directing'], 'available', true),
    (gen_random_uuid(), 'user_oladimeji', 'oladimeji@tenmediahq.com', 'Oladimeji Tiamiyu', 'assistant_lead', 'envoy_nation', ARRAY['envoy_nation'], 'Lead', ARRAY['Leadership', 'Production', 'Video Editing'], 'available', true),
    (gen_random_uuid(), 'user_oladipupo', 'oladipupo@tenmediahq.com', 'Oladipupo Hilton', 'unit_head', 'envoy_nation', ARRAY['envoy_nation'], 'Photography', ARRAY['Photography', 'Photo Editing'], 'available', true),
    (gen_random_uuid(), 'user_oluseye', 'oluseye@tenmediahq.com', 'Bro Oluseye', 'unit_head', 'envoy_nation', ARRAY['envoy_nation'], 'Projection & Livestream', ARRAY['Projection', 'Livestream'], 'available', true),
    (gen_random_uuid(), 'user_michel', 'michel@tenmediahq.com', 'Michel Adimula', 'unit_head', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Camera Operation', 'Mixing'], 'available', true),
    (gen_random_uuid(), 'user_peter_n', 'peter.ndiparya@tenmediahq.com', 'Peter Ndiparya', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Projection & Livestream', ARRAY['Support', 'Projection'], 'available', true),
    (gen_random_uuid(), 'user_jemima', 'jemima@tenmediahq.com', 'Jemima Eromon', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Projection & Livestream', ARRAY['Projection Operator'], 'available', true),
    (gen_random_uuid(), 'user_tobi', 'tobi@tenmediahq.com', 'Bro Tobi', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Projection & Livestream', ARRAY['Projection Operator'], 'available', true),
    (gen_random_uuid(), 'user_jasper', 'jasper@tenmediahq.com', 'Jasper Eromon', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Camera Operation', 'Mixing'], 'available', true),
    (gen_random_uuid(), 'user_olukunle', 'olukunle@tenmediahq.com', 'Olukunle Ogunniran', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Camera Operation', 'Mixing'], 'available', true),
    (gen_random_uuid(), 'user_wade', 'wade@tenmediahq.com', 'Wade Osunmakinde', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Camera Operation', 'Mixing'], 'available', true),
    (gen_random_uuid(), 'user_favour_o', 'favour.olusanya@tenmediahq.com', 'Favour Olusanya', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Camera Operation', 'PTZ'], 'available', true),
    (gen_random_uuid(), 'user_favour_a', 'favour.anwo@tenmediahq.com', 'Favour Anwo', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Camera Operation'], 'available', true),
    (gen_random_uuid(), 'user_damilare', 'damilare@tenmediahq.com', 'Damilare Akeredolu', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Camera Operation', 'Mixing'], 'available', true),
    (gen_random_uuid(), 'user_adeleke', 'adeleke@tenmediahq.com', 'Adeleke Matanmi', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Camera Operation'], 'available', true),
    (gen_random_uuid(), 'user_abiodun', 'abiodun@tenmediahq.com', 'Abiodun Durojaiye', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Production', ARRAY['Support'], 'available', true),
    (gen_random_uuid(), 'user_seun', 'seun@tenmediahq.com', 'Seun Morenikeji', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Photography', ARRAY['Photography'], 'available', true),
    (gen_random_uuid(), 'user_chase', 'chase@tenmediahq.com', 'Chase Hadley', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Photography', ARRAY['Photography', 'Photo Editing'], 'available', true),
    (gen_random_uuid(), 'user_onose', 'onose@tenmediahq.com', 'Onose Thompson', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Photography', ARRAY['Photography'], 'available', true),
    (gen_random_uuid(), 'user_precious', 'precious@tenmediahq.com', 'Precious Achudume', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Photography', ARRAY['Support', 'Photography'], 'available', true),
    (gen_random_uuid(), 'user_oladeinde', 'oladeinde@tenmediahq.com', 'Oladeinde Omidiji', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Photography', ARRAY['Photography', 'Camera Operation'], 'available', true),
    (gen_random_uuid(), 'user_temidayo', 'temidayo@tenmediahq.com', 'Temidayo Peters', 'member', 'envoy_nation', ARRAY['envoy_nation'], 'Post-Production', ARRAY['Video Editing'], 'available', true)
ON CONFLICT (user_id) DO NOTHING;

-- SEED SERVICES
INSERT INTO services (service_id, title, date, time, type, team_id, description) VALUES
    ('svc_lb_mar06', 'Leicester Blessing', '2026-03-05', '18:30', 'midweek', 'envoy_nation', 'Midweek service - Thursday'),
    ('svc_lb_mar13', 'Leicester Blessing', '2026-03-12', '18:30', 'midweek', 'envoy_nation', 'Midweek service - Thursday'),
    ('svc_lb_mar20', 'Leicester Blessing', '2026-03-19', '18:30', 'midweek', 'envoy_nation', 'Midweek service - Thursday'),
    ('svc_cwpmo_mar', 'Connected with PMO', '2026-03-26', '18:30', 'special', 'envoy_nation', 'Last Thursday - Connected with PMO'),
    ('svc_sun_mar08', 'Sunday Service', '2026-03-08', '11:00', 'sunday_service', 'envoy_nation', 'Sunday worship service'),
    ('svc_sun_mar15', 'Sunday Service', '2026-03-15', '11:00', 'sunday_service', 'envoy_nation', 'Sunday worship service'),
    ('svc_sun_mar22', 'Sunday Service', '2026-03-22', '11:00', 'sunday_service', 'envoy_nation', 'Sunday worship service'),
    ('svc_sun_mar29', 'Sunday Service', '2026-03-29', '11:00', 'sunday_service', 'envoy_nation', 'Sunday worship service'),
    ('svc_lb_apr02', 'Leicester Blessing', '2026-04-02', '18:30', 'midweek', 'envoy_nation', 'Midweek service - Thursday'),
    ('svc_lb_apr09', 'Leicester Blessing', '2026-04-09', '18:30', 'midweek', 'envoy_nation', 'Midweek service - Thursday'),
    ('svc_lb_apr16', 'Leicester Blessing', '2026-04-16', '18:30', 'midweek', 'envoy_nation', 'Midweek service - Thursday'),
    ('svc_cwpmo_apr', 'Connected with PMO', '2026-04-30', '18:30', 'special', 'envoy_nation', 'Last Thursday - Connected with PMO'),
    ('svc_sun_apr05', 'Sunday Service', '2026-04-05', '11:00', 'sunday_service', 'envoy_nation', 'Sunday worship service'),
    ('svc_sun_apr12', 'Sunday Service', '2026-04-12', '11:00', 'sunday_service', 'envoy_nation', 'Sunday worship service'),
    ('svc_sun_apr19', 'Sunday Service', '2026-04-19', '11:00', 'sunday_service', 'envoy_nation', 'Sunday worship service'),
    ('svc_sun_apr26', 'Sunday Service', '2026-04-26', '11:00', 'sunday_service', 'envoy_nation', 'Sunday worship service')
ON CONFLICT (service_id) DO NOTHING;

-- SEED ROTAS (using dollar quoting to avoid escape issues)
INSERT INTO rotas (service_id, team_id, assignments, status) VALUES
    ('svc_sun_mar08', 'envoy_nation', $$[{"role":"PTZ Cam Op","assigned_to":"user_favour_o","name":"Favour Olusanya","status":"pending"},{"role":"Back Cam Op 1","assigned_to":"user_olukunle","name":"Olukunle Ogunniran","status":"pending"},{"role":"Roam Cam Op","assigned_to":"user_michel","name":"Michel Adimula","status":"pending"},{"role":"Side Cam Op","assigned_to":"user_damilare","name":"Damilare Akeredolu","status":"pending"},{"role":"Mixing Op","assigned_to":"user_wade","name":"Wade Osunmakinde","status":"pending"},{"role":"Projection Operator","assigned_to":"user_tobi","name":"Bro Tobi","status":"pending"},{"role":"Photographer","assigned_to":"user_oladipupo","name":"Oladipupo Hilton","status":"pending"},{"role":"Photo Editor","assigned_to":"user_chase","name":"Chase Hadley","status":"pending"},{"role":"Video Editor","assigned_to":"user_temidayo","name":"Temidayo Peters","status":"pending"}]$$::jsonb, 'draft'),
    ('svc_lb_mar06', 'envoy_nation', $$[{"role":"Back Cam Op 1","assigned_to":"user_olukunle","name":"Olukunle Ogunniran","status":"pending"},{"role":"Mixing Op","assigned_to":"user_jasper","name":"Jasper Eromon","status":"pending"},{"role":"Projection Operator","assigned_to":"user_jemima","name":"Jemima Eromon","status":"pending"},{"role":"Photographer","assigned_to":"user_oladipupo","name":"Oladipupo Hilton","status":"pending"},{"role":"Video Editor","assigned_to":"user_oladimeji","name":"Oladimeji Tiamiyu","status":"pending"}]$$::jsonb, 'draft');

-- SEED CHECKLIST (matches Media_Team_Service_Checklist.docx - 29 items in 5 sections)
INSERT INTO checklists (service_id, team_id, items) VALUES
    ('svc_sun_mar08', 'envoy_nation', $$[
{"id":"chk_1","text":"Ensure all team members are present","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_2","text":"Check the rota to ensure all unit members officiating are present, if yes tick and if no have reached out?","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_3","text":"Assign specific roles and responsibilities","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_4","text":"Turn on all sockets, media appliances, screens including LED screen","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_5","text":"Inspect that all equipments are properly connected","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_6","text":"Verify cameras, switchers, and monitors","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_7","text":"Confirm HDMI cables are working","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_8","text":"Check battery levels and replace if needed","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_9","text":"Ensure proper camera angles and framing","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_10","text":"Confirm pulpit camera is properly placed","checked":false,"section":"PRE-SERVICE SETUP"},
{"id":"chk_11","text":"Check communication headsets for clear audio","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_12","text":"Ensure livestream feed audio is clear","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_13","text":"Set up laptop/system for projection and livestream","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_14","text":"Download images/videos/lyrics from WhatsApp or Drive","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_15","text":"Verify slides, lyrics, and video cues","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_16","text":"Run short cue test for smooth transitions","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_17","text":"Start streaming 5 mins before service start time","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_18","text":"Confirm overlays/lower-thirds are working","checked":false,"section":"TECHNICAL RUN-THROUGH"},
{"id":"chk_19","text":"Ensure smooth camera switching and transitions","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_20","text":"Monitor video quality and adjust as needed","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_21","text":"Stay in sync with presentation and sound teams","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_22","text":"Be ready to troubleshoot issues quickly","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_23","text":"Document conflicts/challenges faced during service","checked":false,"section":"LIVE PRODUCTION MONITORING"},
{"id":"chk_24","text":"List all equipment collected after first service","checked":false,"section":"EQUIPMENT HANDOVER"},
{"id":"chk_25","text":"Ensure proper handover to second service team","checked":false,"section":"EQUIPMENT HANDOVER"},
{"id":"chk_26","text":"Second Service Lead signs off confirming equipment is intact","checked":false,"section":"EQUIPMENT HANDOVER"},
{"id":"chk_27","text":"Discuss what went well and issues faced","checked":false,"section":"DEBRIEF & FEEDBACK"},
{"id":"chk_28","text":"Note any equipment needing maintenance (to be done by sub unit head)","checked":false,"section":"DEBRIEF & FEEDBACK"},
{"id":"chk_29","text":"Plan improvements for the next service [during weekly standup]","checked":false,"section":"DEBRIEF & FEEDBACK"}
]$$::jsonb);

-- RLS INSERT POLICIES
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
