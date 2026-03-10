# Supabase Storage Setup - Profile Photos

## Create Storage Bucket

1. Go to your **Supabase Dashboard** → **Storage** (left sidebar)
2. Click **New Bucket**
3. Enter bucket name: `profile-photos`
4. Check **Public bucket** (so profile photos are publicly accessible)
5. Click **Create bucket**

## Set Storage Policies

After creating the bucket, click on it and go to **Policies** tab:

### Allow authenticated users to upload
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');
```

### Allow authenticated users to update (replace) their avatar
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos');
```

### Allow public read access
```sql
CREATE POLICY "Public read access for profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');
```

## Alternative: Run all policies via SQL Editor

Go to **SQL Editor** and run:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'profile-photos');

CREATE POLICY "Public read access for profile photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'profile-photos');
```

That's it! Profile photo uploads will now work in the app.
