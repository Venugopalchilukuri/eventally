-- Check and Set Admin Role
-- Run this in Supabase SQL Editor

-- Step 1: Check current user roles
SELECT id, email, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;

-- Step 2: Find your user by email (replace with your actual email)
SELECT id, email, role 
FROM profiles 
WHERE email = 'your-email@example.com';

-- Step 3: Set your user as admin (replace with your actual email)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Step 4: Verify the change
SELECT id, email, role 
FROM profiles 
WHERE email = 'your-email@example.com';

-- Alternative: Set admin by user ID (if you know your user ID)
-- UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id-here';
