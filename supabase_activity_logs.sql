-- TEN MediaHQ - Activity Logs Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    details TEXT,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view activity logs" ON activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert activity logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);
