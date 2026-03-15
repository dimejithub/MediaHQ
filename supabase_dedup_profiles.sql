-- TEN MediaHQ - Profile Deduplication & Cleanup
-- Run this in Supabase SQL Editor
-- Removes duplicate profiles keeping the one with the most data

-- Step 1: View duplicates before deleting (optional - run SELECT first to check)
-- SELECT name, email, COUNT(*) as cnt FROM profiles GROUP BY name, email HAVING COUNT(*) > 1;

-- Step 2: Delete duplicates - keeps the profile with most non-null fields
-- For profiles with same email, keep the one with onboarding_completed or most data
DELETE FROM profiles a
USING profiles b
WHERE a.id <> b.id
  AND a.email = b.email
  AND a.email IS NOT NULL
  AND (
    -- Keep the one with onboarding completed
    (b.onboarding_completed = true AND (a.onboarding_completed IS NULL OR a.onboarding_completed = false))
    OR
    -- If neither completed onboarding, keep the newer one
    (COALESCE(b.onboarding_completed, false) = COALESCE(a.onboarding_completed, false) AND b.created_at > a.created_at)
  );

-- Step 3: Delete duplicates by name (for pre-seeded profiles without email)
DELETE FROM profiles a
USING profiles b
WHERE a.id <> b.id
  AND a.name = b.name
  AND (a.email IS NULL)
  AND b.email IS NOT NULL;

-- Step 4: Verify - check remaining profiles
SELECT id, name, email, role, unit, onboarding_completed, created_at FROM profiles ORDER BY name;
