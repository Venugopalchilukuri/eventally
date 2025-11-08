-- Fix: Allow admins to view all registrations
-- Run this in Supabase SQL Editor

-- Check current policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'registrations';

-- Add policy for admins to view all registrations
CREATE POLICY "Admins can view all registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verify the policy was created
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'registrations' 
AND policyname = 'Admins can view all registrations';

-- Success! Admins can now see all registrations
