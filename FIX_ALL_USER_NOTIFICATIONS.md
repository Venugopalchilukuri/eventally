# Fix: Send Notifications to ALL Registered Users

## Problem
Only 5 users are receiving email notifications when admin creates an event, instead of all registered users.

## Root Causes (Possible)

### 1. **Missing Service Role Key** ⚠️ MOST LIKELY
The API might be using the anon key instead of the service role key, which could be limited by RLS policies.

### 2. **Database Query Limit**
The query was not explicitly setting a high limit to fetch all users.

## ✅ What I Fixed

### Updated: `/src/app/api/send-new-event-notification/route.ts`

**Changes Made:**
1. ✅ Added explicit `.limit(10000)` to fetch up to 10,000 users
2. ✅ Added `.not('email', 'is', null)` to filter null emails
3. ✅ Added count tracking to show total vs fetched
4. ✅ Added debug logging to verify which key is being used

**Before:**
```typescript
const { data: profiles, error: profilesError } = await supabase
  .from('profiles')
  .select('email');
```

**After:**
```typescript
const { data: profiles, error: profilesError, count } = await supabase
  .from('profiles')
  .select('email', { count: 'exact' })
  .not('email', 'is', null)
  .limit(10000); // Explicit high limit
```

## 🔍 Next Steps - VERIFY YOUR SETUP

### Step 1: Check Your Environment Variables

**CRITICAL:** Verify your `.env.local` file has the service role key:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # ← THIS IS CRITICAL!
```

**Where to find your Service Role Key:**
1. Go to Supabase Dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Copy the `service_role` key (NOT the `anon` key)
5. Add it to your `.env.local`

### Step 2: Verify Profiles Table Has All Users

Run this SQL in Supabase SQL Editor:

```sql
-- Check total users in profiles table
SELECT COUNT(*) as total_users FROM profiles;

-- Check users with emails
SELECT COUNT(*) as users_with_emails FROM profiles WHERE email IS NOT NULL;

-- View all users
SELECT id, email, role, created_at 
FROM profiles 
ORDER BY created_at DESC;
```

**Expected Result:**
- `total_users` should match the number of registered users
- `users_with_emails` should match total users
- You should see ALL your registered users in the list

### Step 3: Ensure Profiles Are Auto-Created

If some users are missing from the profiles table, run this SQL:

```sql
-- Populate profiles from auth.users
INSERT INTO profiles (id, email, role)
SELECT 
  id,
  email,
  'user' as role
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify
SELECT COUNT(*) as profiles_created FROM profiles;
```

### Step 4: Test the Fix

1. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Create a test event as admin**

3. **Check the console logs** - you should see:
   ```
   🔍 DEBUG - Using service role key: true  ← Should be TRUE!
   🔍 DEBUG - Profiles query result: { 
     profileCount: X, 
     totalCount: X,    ← Both numbers should match
     error: undefined 
   }
   ✅ DEBUG - Found X users to notify  ← Should be ALL users
   ```

### Step 5: Interpret the Logs

**✅ GOOD - Issue is fixed:**
```
🔍 DEBUG - Using service role key: true
profileCount: 25
totalCount: 25
✅ DEBUG - Found 25 users to notify
```

**❌ BAD - Service role key missing:**
```
🔍 DEBUG - Using service role key: false  ← FIX THIS!
profileCount: 5
totalCount: 25  ← More users exist than fetched!
```
→ **Solution:** Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

**❌ BAD - Missing users in database:**
```
🔍 DEBUG - Using service role key: true
profileCount: 5
totalCount: 5  ← Database only has 5 users
```
→ **Solution:** Run Step 3 SQL to populate profiles from auth.users

## 🔐 Security Note

**NEVER commit `.env.local` to Git!** 

The service role key bypasses Row Level Security (RLS) and should only be used in server-side API routes, never in client-side code.

Your `.gitignore` should already include:
```
.env.local
.env*.local
```

## 📧 How It Works Now

1. Admin creates an event
2. API route fetches **ALL** profiles with `.limit(10000)`
3. Service role key **bypasses RLS** restrictions
4. Filters out null emails with `.not('email', 'is', null)`
5. Sends emails to **ALL** registered users
6. Logs show exactly how many users were notified

## Still Not Working?

If after following all steps you still have issues:

1. **Check RLS Policies:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

2. **Verify the policy allows SELECT:**
   ```sql
   CREATE POLICY "Public profiles are viewable by everyone"
     ON profiles FOR SELECT
     USING (true);
   ```

3. **Check if profiles table exists:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'profiles';
   ```

4. **Share the debug logs** - specifically:
   - `Using service role key: true/false`
   - `profileCount` vs `totalCount`
   - Any error messages

---

**Files Modified:**
- ✅ `/src/app/api/send-new-event-notification/route.ts`

**Action Required:**
1. ⚠️ Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
2. 🔄 Restart dev server
3. ✅ Test creating an event as admin
