# Email Confirmation Not Working - Troubleshooting Guide

## Issue
Users are signing up but not receiving confirmation emails.

## Possible Causes & Solutions

### 1. Check Supabase Email Settings

**Go to Supabase Dashboard:**
1. Open https://supabase.com/dashboard
2. Select your `eventally` project
3. Go to **Authentication** → **Email Templates**
4. Check if "Confirm signup" template is enabled

### 2. Enable Email Confirmations

**In Supabase Dashboard:**
1. Go to **Authentication** → **Settings**
2. Scroll to **Email Auth**
3. Make sure **"Enable email confirmations"** is checked
4. If it's unchecked, users can sign in immediately without email confirmation

**Current Status Check:**
- If disabled: Users can sign in without confirming email
- If enabled: Users must confirm email before signing in

### 3. Check SMTP Configuration

**Supabase has two email modes:**

**A. Default Supabase Emails (Current - Has Limits)**
- Free tier: Limited emails per hour
- Emails may be delayed or not sent
- Often go to spam
- **Solution**: Set up custom SMTP

**B. Custom SMTP (Recommended)**
1. Go to **Project Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable custom SMTP
4. Configure with your email provider:

**Gmail SMTP Example:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: your-app-password (not regular password!)
Sender Email: your-email@gmail.com
Sender Name: Eventally
```

**Other Options:**
- **SendGrid**: Free 100 emails/day
- **Mailgun**: Free 5,000 emails/month
- **AWS SES**: Very cheap
- **Resend**: Modern, easy setup

### 4. Quick Fix - Disable Email Confirmation (Temporary)

**If you want users to sign in immediately:**

1. Go to Supabase Dashboard
2. **Authentication** → **Settings**
3. Find **"Enable email confirmations"**
4. **Uncheck it**
5. Save changes

**Result:**
- Users can sign in immediately after signup
- No email confirmation needed
- Less secure, but works for testing

### 5. Check Email Rate Limits

**Supabase Free Tier Limits:**
- Limited emails per hour
- If you've been testing a lot, you may have hit the limit
- Wait 1 hour and try again
- Or upgrade to Pro plan

### 6. Test Email Delivery

**In Supabase Dashboard:**
1. Go to **Authentication** → **Users**
2. Find your test user
3. Click the three dots (...)
4. Select **"Send password recovery email"**
5. Check if you receive this email
6. If yes: Signup emails should work
7. If no: SMTP configuration issue

### 7. Check Spam Folder

- Check your spam/junk folder
- Supabase default emails often go to spam
- Add `noreply@mail.app.supabase.io` to contacts

### 8. Verify Email Template

**In Supabase Dashboard:**
1. **Authentication** → **Email Templates**
2. Click **"Confirm signup"**
3. Make sure the template is active
4. Check the confirmation URL is correct:
   - Should be: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

## Recommended Solution

**For Production (Best):**
1. Set up custom SMTP (SendGrid, Mailgun, or Gmail)
2. Keep email confirmations enabled
3. Configure proper email templates

**For Quick Testing:**
1. Temporarily disable email confirmations
2. Users can sign in immediately
3. Re-enable later when SMTP is configured

## How to Check Current Status

Run this in Supabase SQL Editor:
```sql
SELECT 
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

- If `email_confirmed_at` is NULL: Email not confirmed
- If it has a timestamp: Email was confirmed

## Next Steps

1. **Check Supabase email settings** (5 minutes)
2. **Decide**: Disable confirmations OR set up SMTP
3. **Test** with a new signup
4. **Verify** email is received

## Need Help?

Let me know:
1. Do you want to disable email confirmations temporarily?
2. Or do you want to set up proper SMTP?
3. What email provider do you want to use?
