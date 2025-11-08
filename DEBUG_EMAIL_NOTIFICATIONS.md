# 🐛 Debugging Email Notifications - Step by Step Guide

## Issue: Emails Not Being Sent When Admin Creates Events

Let's systematically check each component to find the issue.

---

## Step 1: Check Console Logs (Most Important!)

### When you create an event, check your browser console AND terminal:

**Browser Console (F12):**
- Look for: `📧 Email notifications sent: { ... }`
- Or errors: `Failed to send notifications: ...`

**Terminal/Server Console:**
- Look for: `📧 New event notification sent: X successful, Y failed`
- Or errors: `Error in send-new-event-notification:`

### What to check:
```
✅ If you see: "No users to notify" → Check Step 2 (profiles table)
✅ If you see: "0 successful, X failed" → Check Step 3 (email service)
✅ If you see nothing → Check Step 4 (admin role)
✅ If you see: "Failed to fetch user profiles" → Check Step 5 (database connection)
```

---

## Step 2: Verify Profiles Table Has Users

### Check in Supabase SQL Editor:

```sql
-- Check if profiles table exists
SELECT * FROM profiles LIMIT 5;

-- Check how many users have emails
SELECT COUNT(*) as total_users FROM profiles WHERE email IS NOT NULL;

-- See all emails
SELECT id, email, role, created_at FROM profiles;
```

### Expected Results:
- ✅ Table should exist (not error)
- ✅ Should show at least 1 user with an email
- ✅ Email column should not be NULL

### If table doesn't exist or is empty:
See `USER_PROFILES_DB_SETUP.sql` or run:
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Populate from existing auth users
INSERT INTO profiles (id, email, role)
SELECT id, email, 'user' 
FROM auth.users
ON CONFLICT (id) DO NOTHING;
```

---

## Step 3: Verify Admin Role

### Check if your user is actually an admin:

```sql
-- Replace with your email
SELECT id, email, role 
FROM profiles 
WHERE email = 'your-email@example.com';
```

### Expected Result:
- `role` column should show **'admin'** (not 'user')

### If role is not admin, set it:
```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

### Verify in code:
Add this log to `src/app/create/page.tsx` (line 36):

```typescript
useEffect(() => {
  if (!user) {
    router.push("/login");
  } else {
    checkIsAdmin(user.id).then(admin => {
      console.log('🔍 Is Admin:', admin);  // ADD THIS LINE
      setIsAdmin(admin);
    });
  }
}, [user, router]);
```

**After adding, refresh page and check console. Should show: `🔍 Is Admin: true`**

---

## Step 4: Check Resend API Configuration

### 1. Verify environment variables exist:

Create a test file: `test-env.js`
```javascript
// test-env.js
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'EXISTS ✅' : 'MISSING ❌');
console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL || 'MISSING ❌');
console.log('Key starts with re_:', process.env.RESEND_API_KEY?.startsWith('re_') ? 'YES ✅' : 'NO ❌');
```

Run: `node test-env.js`

### 2. Check .env.local file:

```bash
# Open file
notepad .env.local

# Should contain:
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Eventally <onboarding@resend.dev>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Resend API Key (if missing):

1. Go to https://resend.com
2. Sign up / Login
3. Go to "API Keys" section
4. Click "Create API Key"
5. Copy key (starts with `re_`)
6. Add to `.env.local`

### 4. Restart dev server:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Step 5: Test API Route Directly

### Create a test script to call the API directly:

**Create file: `test-notifications.js`**
```javascript
const testData = {
  eventTitle: "Test Event",
  eventDate: "2025-11-15",
  eventTime: "14:00",
  eventLocation: "Test Location",
  eventDescription: "This is a test event",
  eventCategory: "Technology",
  eventId: "test-123"
};

fetch('http://localhost:3000/api/send-new-event-notification', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(res => res.json())
.then(data => {
  console.log('✅ API Response:', data);
})
.catch(error => {
  console.error('❌ API Error:', error);
});
```

**Run:**
```bash
node test-notifications.js
```

**Expected output:**
```json
{
  "success": true,
  "message": "Email notifications sent",
  "emailsSent": 3,
  "emailsFailed": 0,
  "totalUsers": 3
}
```

---

## Step 6: Add Debug Logs to API Route

### Modify `src/app/api/send-new-event-notification/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route called'); // ADD THIS
    
    const body = await request.json();
    console.log('🔍 Request body:', body); // ADD THIS
    
    const { eventTitle, eventDate, eventTime, eventLocation, eventDescription, eventCategory, eventId } = body;

    if (!eventTitle || !eventDate || !eventTime || !eventLocation || !eventId) {
      console.log('❌ Missing required fields'); // ADD THIS
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching profiles...'); // ADD THIS
    
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('email');

    console.log('🔍 Profiles found:', profiles?.length); // ADD THIS
    console.log('🔍 Profiles data:', profiles); // ADD THIS

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError); // ADD THIS
      // ... rest of code
    }

    // ... rest of the function
  } catch (error: any) {
    console.error('❌ Error in send-new-event-notification:', error);
    // ... rest of code
  }
}
```

**After adding logs, create an event and check terminal output.**

---

## Step 7: Check Email Service Function

### Verify `src/lib/email.ts` sendEmail function works:

Add debug logs:
```typescript
export async function sendEmail({ to, subject, html }: EmailParams) {
  console.log('📧 sendEmail called:', { to, subject }); // ADD THIS
  
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not found. Email not sent.'); // THIS ALREADY EXISTS
    console.log('Email would be sent to:', to);
    console.log('Subject:', subject);
    return { success: true, message: 'Email logged (no API key)' };
  }

  console.log('📧 Sending via Resend...'); // ADD THIS

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || 'Eventally <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });

    console.log('📧 Resend response status:', response.status); // ADD THIS

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Resend error:', error); // ADD THIS
      throw new Error(error.message || 'Failed to send email');
    }

    const data = await response.json();
    console.log('✅ Email sent successfully:', data); // ADD THIS
    return { success: true, data };
  } catch (error: any) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
}
```

---

## Step 8: Quick Checklist

Run through this checklist:

```
□ Step 1: Check browser console for "📧 Email notifications sent"
□ Step 2: Check terminal/server console for logs
□ Step 3: Verify profiles table exists and has users
□ Step 4: Verify your user has role='admin'
□ Step 5: Verify RESEND_API_KEY exists in .env.local
□ Step 6: Verify RESEND_API_KEY starts with 're_'
□ Step 7: Restart dev server after adding API key
□ Step 8: Check isAdmin state in create page console
□ Step 9: Test API route directly with test-notifications.js
□ Step 10: Add debug logs to API route and email.ts
```

---

## Common Issues & Solutions

### Issue 1: "No users to notify"
**Cause:** Profiles table is empty or doesn't exist  
**Solution:** Run Step 2 SQL queries to populate profiles

### Issue 2: Nothing in console logs
**Cause:** Not an admin or isAdmin is false  
**Solution:** Run Step 3 to set admin role

### Issue 3: "Email logged (no API key)"
**Cause:** RESEND_API_KEY not set or server not restarted  
**Solution:** 
1. Add key to .env.local
2. Restart dev server (Ctrl+C, then npm run dev)

### Issue 4: API returns 500 error
**Cause:** Database connection issue or profiles table RLS  
**Solution:** 
```sql
-- Check RLS policies
SELECT * FROM profiles; -- Should work without auth in SQL editor

-- If fails, update RLS:
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);
```

### Issue 5: Emails not arriving in inbox
**Cause:** Resend API key invalid or from email not verified  
**Solution:**
1. Check Resend dashboard for error logs
2. Use default from: `Eventally <onboarding@resend.dev>`
3. Check spam folder

---

## Step 9: Manual Test Without Admin Check

**Temporarily bypass admin check for testing:**

In `src/app/create/page.tsx`, change line 89:
```typescript
// FROM:
if (isAdmin && data && data.length > 0) {

// TO (TEMPORARY TEST):
if (true && data && data.length > 0) {  // Always send for testing
```

Create an event. If emails work now, the issue is admin role check.

**REMEMBER TO CHANGE BACK AFTER TESTING!**

---

## Step 10: Contact Me With Results

After running through these steps, provide me with:

1. **Console logs** (browser and terminal)
2. **SQL query results** from Step 2 and 3
3. **Environment check** from Step 4
4. **Test script results** from Step 5
5. **Any error messages** you see

This will help me pinpoint the exact issue!

---

## Quick Fix Commands

**Reset everything and start fresh:**

```bash
# 1. Stop server
Ctrl+C

# 2. Check .env.local exists
dir .env.local

# 3. Open .env.local and verify keys exist
notepad .env.local

# 4. Restart server
npm run dev

# 5. Check Supabase
# Run in SQL Editor:
SELECT COUNT(*) FROM profiles WHERE email IS NOT NULL;
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
SELECT * FROM profiles WHERE role = 'admin';
```

---

## Expected Successful Flow

When everything works correctly, you should see:

**Browser Console:**
```
🔍 Is Admin: true
📧 Email notifications sent: {
  success: true,
  message: "Email notifications sent",
  emailsSent: 3,
  emailsFailed: 0,
  totalUsers: 3
}
```

**Terminal Console:**
```
🔍 API Route called
🔍 Request body: { eventTitle: "...", ... }
🔍 Fetching profiles...
🔍 Profiles found: 3
📧 sendEmail called: { to: "user1@example.com", ... }
📧 Sending via Resend...
📧 Resend response status: 200
✅ Email sent successfully
📧 New event notification sent: 3 successful, 0 failed
```

**User Inbox:**
- Email arrives within 2-5 seconds
- Subject: "New Event: [Your Event Title]"
- Beautiful HTML email with event details

---

Good luck debugging! Let me know which step reveals the issue. 🚀
