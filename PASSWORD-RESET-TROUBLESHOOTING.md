# Password Reset Troubleshooting

## Current Error: "Error sending recovery email"

This error means Supabase couldn't send the password reset email. Here are the most common causes and fixes:

### 1. **User Doesn't Exist** (Most Common)

The email address `venugopalchilukuri026@gmail.com` might not be registered in your Supabase database.

**How to Check:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to: **Authentication** → **Users**
4. Search for: `venugopalchilukuri026@gmail.com`

**If user NOT found:**
- You need to **sign up first** at: http://localhost:3000/signup
- Use the same email address
- Then try password reset again

### 2. **Email Service Not Configured**

Supabase needs an email service to send password reset emails.

**Check SMTP Configuration:**
1. Go to: **Authentication** → **Email** → **SMTP Settings**
2. Make sure SMTP is configured with:
   - Host: `smtp.gmail.com`
   - Port: `587` or `465`
   - Username: Your Gmail address
   - Password: Your Gmail App Password
3. Click **Save changes**

**OR Use Supabase's Built-in Email:**
- If you haven't configured SMTP, Supabase will use its built-in email service
- Emails from Supabase often go to **spam folder** - check there!

### 3. **Redirect URL Not Allowed**

**Check URL Configuration:**
1. Go to: **Authentication** → **URL Configuration**
2. Make sure these URLs are in the "Redirect URLs" list:
   - `http://localhost:3000/*`
   - `https://eventally-5xap.vercel.app/*`

### 4. **Rate Limiting**

If you've tried multiple times, Supabase might be rate-limiting you.

**Solution:**
- Wait 5-10 minutes
- Try again with a different email
- Or restart your dev server

## Next Steps:

### Step 1: Refresh Browser
1. Press `Ctrl + Shift + R` to hard refresh
2. Open browser console (F12)
3. Go to: http://localhost:3000/forgot-password
4. Try password reset again

### Step 2: Check Console Logs
After trying again, you should see detailed logs in the console:

```
🔐 Password Reset Request: {
  email: "...",
  redirectTo: "http://localhost:3000/reset-password",
  ...
}

🔐 Password Reset Response: {
  error: null or {...}
}
```

**If error is null** → Email was sent! Check your inbox and spam folder
**If error exists** → Share the error message for more help

### Step 3: Verify Email Received
1. Check inbox for email from Supabase
2. Check spam/junk folder
3. Email subject: "Reset Your Password" or similar
4. Click the link in the email

## Most Likely Solution:

**The user probably doesn't exist in Supabase yet!**

1. Go to: http://localhost:3000/signup
2. Sign up with: `venugopalchilukuri026@gmail.com`
3. Complete the signup process
4. Then try password reset

---

## Still Having Issues?

After refreshing and trying again, check the browser console and share:
1. The exact error message from the console
2. Screenshot of the console logs
3. Confirmation that the user exists in Supabase → Authentication → Users
