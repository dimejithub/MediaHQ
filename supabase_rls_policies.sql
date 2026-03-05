-- TEN MediaHQ - Additional RLS Policies
-- Run AFTER the seed script in Supabase SQL Editor

-- =====================
-- UPDATE POLICIES
-- =====================

-- Profiles: users can update their own profile
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Profiles: admins can update any profile (for role management)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update profiles') THEN
        CREATE POLICY "Admins can update profiles" ON profiles FOR UPDATE TO authenticated USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
        );
    END IF;
END $$;

-- Equipment: users can update (checkout/return)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'equipment' AND policyname = 'Users can update equipment') THEN
        CREATE POLICY "Users can update equipment" ON equipment FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Services: admins can update
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Admins can update services') THEN
        CREATE POLICY "Admins can update services" ON services FOR UPDATE TO authenticated USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
        ) WITH CHECK (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
        );
    END IF;
END $$;

-- Services: admins can delete
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Admins can delete services') THEN
        CREATE POLICY "Admins can delete services" ON services FOR DELETE TO authenticated USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead'))
        );
    END IF;
END $$;

-- Attendance: admins can update
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'attendance' AND policyname = 'Admins can update attendance') THEN
        CREATE POLICY "Admins can update attendance" ON attendance FOR UPDATE TO authenticated USING (
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('director', 'team_lead', 'assistant_lead', 'unit_head'))
        );
    END IF;
END $$;

-- Checklists: users can update
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checklists' AND policyname = 'Users can update checklists') THEN
        CREATE POLICY "Users can update checklists" ON checklists FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- Notifications: users can update own (mark as read)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can delete own notifications') THEN
        CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE TO authenticated USING (
            user_id = (SELECT user_id FROM profiles WHERE id = auth.uid())
        );
    END IF;
END $$;

-- Allow SELECT on profiles for all authenticated users (read team directory)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'All users can read profiles') THEN
        CREATE POLICY "All users can read profiles" ON profiles FOR SELECT TO authenticated USING (true);
    END IF;
END $$;

-- Allow anon SELECT on profiles for demo/public access
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Anon can read profiles') THEN
        CREATE POLICY "Anon can read profiles" ON profiles FOR SELECT TO anon USING (true);
    END IF;
END $$;

-- Allow anon read on services, equipment, rotas for public/demo
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'Anon can read services') THEN
        CREATE POLICY "Anon can read services" ON services FOR SELECT TO anon USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'equipment' AND policyname = 'Anon can read equipment') THEN
        CREATE POLICY "Anon can read equipment" ON equipment FOR SELECT TO anon USING (true);
    END IF;
END $$;
