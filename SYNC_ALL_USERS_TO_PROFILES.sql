-- ==========================================
-- SYNC ALL AUTH USERS TO PROFILES TABLE
-- ==========================================
-- This script ensures all users from auth.users are in the profiles table
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
SELECT '=== BEFORE SYNC ===' as status;

-- Total auth users
SELECT 'Total auth users:' as check_name, COUNT(*) as count FROM auth.users;

-- Total profile users
SELECT 'Total profiles:' as check_name, COUNT(*) as count FROM profiles;

-- Missing profiles
SELECT 'Missing profiles:' as check_name, COUNT(*) as count 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);

-- Step 2: Show which users are missing from profiles
SELECT '=== USERS MISSING FROM PROFILES ===' as status;
SELECT 
  au.id,
  au.email,
  au.created_at as registered_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ORDER BY au.created_at DESC;

-- Step 3: Sync missing users from auth.users to profiles
SELECT '=== SYNCING USERS ===' as status;

INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'user' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify sync completed
SELECT '=== AFTER SYNC ===' as status;

-- Total auth users
SELECT 'Total auth users:' as check_name, COUNT(*) as count FROM auth.users;

-- Total profile users
SELECT 'Total profiles:' as check_name, COUNT(*) as count FROM profiles;

-- Remaining missing profiles (should be 0)
SELECT 'Missing profiles:' as check_name, COUNT(*) as count 
FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);

-- Step 5: Show all profiles with emails
SELECT '=== ALL PROFILES WITH EMAILS ===' as status;
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
WHERE email IS NOT NULL
ORDER BY created_at DESC;

-- Step 6: Count users that will receive notifications
SELECT '=== NOTIFICATION RECIPIENTS ===' as status;
SELECT 'Users who will receive emails:' as info, COUNT(*) as count 
FROM profiles 
WHERE email IS NOT NULL;

-- ==========================================
-- EXPECTED RESULTS:
-- ==========================================
-- ✅ "Missing profiles" should be 0 in AFTER SYNC
-- ✅ "Total auth users" and "Total profiles" should match
-- ✅ "Users who will receive emails" should show ALL registered users
-- ==========================================
