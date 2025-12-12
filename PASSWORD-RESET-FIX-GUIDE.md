# Password Reset Fix - Complete Solution

## ✅ Code Changes Applied

I've updated the password reset functionality with:

1. **Better error handling** - More specific error messages for SMTP, user not found, and rate limiting issues
2. **Improved redirect URL handling** - Prioritizes `window.location.origin` for better client-side handling
3. **Enhanced user feedback** - Clear success messages with instructions to check spam folder

## 🔧 Supabase Configuration Required

The "Error sending recovery email" is a **Supabase configuration issue**, not a code issue. Here's how to fix it:

### Option 1: Disable Email Confirmations (Quickest Fix for Development)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Authentication** → **Providers** → **Email**
4. Find **"Confirm email"** setting
5. **TURN IT OFF** (disable it)
6. Click **Save**

**Why this works:** When email confirmations are enabled but SMTP is not configured, Supabase cannot send emails, causing the error.

### Option 2: Configure SMTP (Recommended for Production)

1. Go to: **Authentication** → **Settings** → **SMTP Settings**
2. Click **"Enable Custom SMTP"**
3. Fill in Gmail SMTP settings:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: venugopalchilukuri400@gmail.com
   Password: [Your 16-character Gmail App Password]
   Sender Email: venugopalchilukuri400@gmail.com
   Sender Name: Eventally
   ```
4. Click **Save**
5. Click **Send test email** to verify

**How to get Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification (if not already enabled)
3. Go to **App Passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password (no spaces)

### Option 3: Add Redirect URLs

1. Go to: **Authentication** → **URL Configuration**
2. Add these redirect URLs:
   ```
   http://localhost:3000/reset-password
   https://eventally-5xap.vercel.app/reset-password
   ```
3. Add these to **Site URL** as well
4. Click **Save**

## 🧪 Testing the Fix

### Step 1: Verify User Exists
1. Go to: **Authentication** → **Users** in Supabase
2. Search for: `venugopalchilukuri026@gmail.com` (or the email from the screenshot)
3. If NOT found, sign up first at your app

### Step 2: Test Password Reset
1. Go to: `http://localhost:3000/forgot-password`
2. Enter your email
3. Click "Send Reset Link"
4. Check for success message
5. Check your email (and spam folder)

### Step 3: Check Console Logs
Open browser DevTools (F12) and check the Console tab for detailed logs:
- Look for `🔐 Password Reset Request:` - shows the redirect URL
- Look for `🔐 Password Reset Response:` - shows any errors

## 🐛 Common Issues & Solutions

### Issue: "Email service is not configured"
**Solution:** Configure SMTP (Option 2 above) OR disable email confirmations (Option 1)

### Issue: "No account found with this email address"
**Solution:** Sign up first at `/signup` with the same email

### Issue: "Too many requests"
**Solution:** Wait 5-10 minutes before trying again (Supabase rate limiting)

### Issue: Email not received
**Solutions:**
- Check spam/junk folder
- Verify SMTP is configured correctly
- Check Supabase logs: **Logs** → **Auth Logs**
- Try with a different email address

### Issue: Reset link doesn't work
**Solutions:**
- Verify redirect URLs are added in Supabase
- Check that the link hasn't expired (valid for 1 hour)
- Make sure you're clicking the latest email

## 📝 Quick Checklist

Before testing, verify:
- [ ] User exists in Supabase → Authentication → Users
- [ ] Email confirmations disabled (for dev) OR SMTP configured (for prod)
- [ ] Redirect URLs added: `http://localhost:3000/reset-password`
- [ ] Code changes deployed (if testing on Vercel)

## 🚀 Deploy to Vercel

After fixing Supabase configuration, deploy the code changes:

```powershell
git add .
git commit -m "fix: improve password reset error handling"
git push origin main
```

Vercel will auto-deploy, or use:
```powershell
.\deploy.ps1
```

## 💡 Recommended Approach

**For Development:**
1. Disable email confirmations in Supabase
2. Test password reset locally
3. Verify it works

**For Production:**
1. Configure SMTP with Gmail
2. Test email delivery
3. Re-enable email confirmations
4. Deploy to Vercel

## 🎯 Most Likely Solution

Based on the error "Error sending recovery email", the issue is almost certainly:

**Email confirmations are enabled but SMTP is not configured.**

**Quick fix:** Go to Supabase → Authentication → Providers → Email → Disable "Confirm email" → Save

This should fix the issue immediately!

## 📞 Still Not Working?

If you've tried all the above and it's still not working:

1. Check Supabase Auth Logs: **Logs** → **Auth Logs**
2. Look for the password reset attempt
3. Check the error details
4. Share the error message for further help

---

**Next Steps:**
1. Go to Supabase and disable email confirmations (Option 1)
2. Test the password reset flow
3. Check your email (and spam folder)
4. If it works, you can configure SMTP later for production
