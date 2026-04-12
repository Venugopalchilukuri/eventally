-- Check email confirmation status for recent users
-- Run this in Supabase SQL Editor

-- 1. Check recent signups and their confirmation status
SELECT 
  email,
  email_confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN '❌ Not Confirmed'
    ELSE '✅ Confirmed'
  END as status,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 as minutes_since_signup
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- 2. Count confirmed vs unconfirmed users
SELECT 
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Unconfirmed'
    ELSE 'Confirmed'
  END as status,
  COUNT(*) as count
FROM auth.users
GROUP BY status;

-- 3. Check if there are any users waiting for confirmation
SELECT 
  COUNT(*) as unconfirmed_users,
  MIN(created_at) as oldest_unconfirmed,
  MAX(created_at) as newest_unconfirmed
FROM auth.users
WHERE email_confirmed_at IS NULL;
