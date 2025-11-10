-- ==========================================
-- SUPABASE STORAGE SETUP FOR EVENT IMAGES
-- ==========================================
-- Run this in Supabase SQL Editor to enable direct image uploads

-- Step 1: Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Set up storage policies to allow authenticated users to upload
-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'event-images');

-- Allow public read access to event images
CREATE POLICY "Public can view event images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'event-images');

-- Allow users to update their own uploaded images
CREATE POLICY "Users can update their own event images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own event images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'event-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'event-images';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ==========================================
-- EXPECTED RESULTS:
-- ==========================================
-- ✅ Bucket 'event-images' should exist with public = true
-- ✅ Four policies should be created for the storage.objects table
-- ✅ Users can now upload images directly from their device
-- ==========================================

-- ==========================================
-- STORAGE BUCKET SETTINGS (Optional)
-- ==========================================
-- To set file size limits, max 5MB per image:
-- Go to Supabase Dashboard > Storage > event-images > Settings
-- Set: Max file size = 5242880 (5MB in bytes)
-- Allowed file types: image/jpeg, image/png, image/gif, image/webp
-- ==========================================
