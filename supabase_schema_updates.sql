-- TEN MediaHQ - Schema Updates
-- Run AFTER the seed script in Supabase SQL Editor

-- Add phone column if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE equipment;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE rotas;
ALTER PUBLICATION supabase_realtime ADD TABLE checklists;
