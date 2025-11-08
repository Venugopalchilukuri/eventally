-- ==========================================
-- QUICK FIX: Email Notifications Not Working
-- ==========================================
-- Run this in Supabase SQL Editor to diagnose and fix common issues

-- Step 1: Check if profiles table exists
SELECT 'Step 1: Checking profiles table...' as status;
SELECT COUNT(*) as total_profiles FROM profiles;

-- Step 2: Check users with emails
SELECT 'Step 2: Users with emails...' as status;
SELECT COUNT(*) as users_with_email FROM profiles WHERE email IS NOT NULL;

-- Step 3: View all users and their roles
SELECT 'Step 3: All users and roles...' as status;
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Step 4: Check for admin users
SELECT 'Step 4: Admin users...' as status;
SELECT 
  email,
  role
FROM profiles 
WHERE role = 'admin';

-- ==========================================
-- FIX 1: Set your account as admin
-- ==========================================
-- IMPORTANT: Replace 'your-email@example.com' with YOUR actual email

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Verify it worked:
SELECT 
  email,
  role,
  'Should show admin' as expected_role
FROM profiles 
WHERE email = 'your-email@example.com';

-- ==========================================
-- FIX 2: If profiles table is empty
-- ==========================================
-- Populate profiles from auth.users

INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'user' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify profiles were created:
SELECT COUNT(*) as profiles_created FROM profiles;

-- ==========================================
-- FIX 3: Check Row Level Security
-- ==========================================
-- Make sure profiles can be read by API

SELECT 'Step 5: Checking RLS policies...' as status;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';

-- If no policies exist or wrong, run this:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies (if any)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create new policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ==========================================
-- FINAL VERIFICATION
-- ==========================================

SELECT '=== FINAL CHECK ===' as status;

-- 1. Total users
SELECT 'Total profiles:' as check_name, COUNT(*) as count FROM profiles;

-- 2. Users with emails
SELECT 'Users with emails:' as check_name, COUNT(*) as count FROM profiles WHERE email IS NOT NULL;

-- 3. Admin users
SELECT 'Admin users:' as check_name, COUNT(*) as count FROM profiles WHERE role = 'admin';

-- 4. Your specific user
SELECT 'Your user info:' as check_name, email, role 
FROM profiles 
WHERE email = 'your-email@example.com';

-- ==========================================
-- Expected Results for Notifications to Work:
-- ==========================================
-- ✅ Total profiles: At least 1
-- ✅ Users with emails: At least 1
-- ✅ Admin users: At least 1 (your account)
-- ✅ Your user info: Shows your email with role='admin'
-- ==========================================
