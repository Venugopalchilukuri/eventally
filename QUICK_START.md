# 🚀 Quick Start - Post Registration Setup

## What You Have ✅
Your Eventally app has a complete event registration system with:
- ✅ Event registration/RSVP functionality
- ✅ "My Registrations" page
- ✅ Email notification templates
- ✅ Automated reminder system (24h before events)
- ✅ User profiles
- ✅ Attendee management for event creators

---

## What To Do Now 🎯

### Step 1: Install Missing Package (if not done)

Check if `resend` is installed:
```bash
npm list resend
```

If not found, install it:
```bash
npm install resend
```

---

### Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Supabase (should already exist)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# Email Service (ADD THESE)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Eventally <onboarding@resend.dev>

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: Cron security
CRON_SECRET=your-random-secret-key
```

**Get your Resend API key:**
1. Go to [resend.com](https://resend.com)
2. Sign up (FREE tier: 100 emails/day, 3k/month)
3. Go to **API Keys** → **Create API Key**
4. Copy and paste into `.env.local`

---

### Step 3: Restart Dev Server

**IMPORTANT:** After adding environment variables, restart:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

### Step 4: Test Registration Flow

#### A. Register for an Event
1. Open http://localhost:3000/events
2. Click **"Register"** on any event
3. Check your email for confirmation

**What should happen:**
- ✅ Button changes to "Registered"
- ✅ Attendee count increases
- ✅ Confirmation email arrives (check spam if not in inbox)

#### B. View My Registrations
1. Click **"My Registrations"** in nav
2. Verify your event appears
3. Try the **"Unregister"** button

---

### Step 5: Test Event Reminders

#### A. Create Test Event for Tomorrow
1. Go to **Create Event**
2. Set date to **tomorrow**
3. Set time to approximately 24 hours from now
4. Fill other details and save
5. **Register for this event**

**Example:**
- Today: Nov 7, 2025 @ 2:00 PM
- Event: Nov 8, 2025 @ 2:00 PM

#### B. Trigger Reminder Manually
Open new browser tab and visit:
```
http://localhost:3000/api/send-event-reminders
```

Or run the test script:
```bash
node test-reminders.js
```

#### C. Check Results
1. **Terminal output** should show:
```
🔔 Checking for events requiring reminders...
📧 Found 1 event(s) requiring reminders
✅ Sent reminder to your@email.com
```

2. **Check your email** for reminder with countdown

---

## 🎯 Quick Command Reference

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Test reminder system
node test-reminders.js

# Check if resend is installed
npm list resend

# Build for production
npm run build

# Start production server
npm start
```

---

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] `resend` package installed
- [ ] Environment variables configured
- [ ] Registration flow tested
- [ ] Email confirmations working
- [ ] Reminders tested with tomorrow's event
- [ ] "My Registrations" page works
- [ ] No errors in console
- [ ] Email open rates checked in Resend dashboard

---

## 🚀 Deploy to Vercel

### 1. Push to GitHub
```bash
git add .
git commit -m "Complete event registration system"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repo
4. Vercel auto-detects Next.js

### 3. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_APP_URL` (your production URL)
- `CRON_SECRET` (optional)

### 4. Deploy
Click **"Deploy"** and wait ~2 minutes

### 5. Verify Cron Jobs
1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Cron Jobs**
3. Verify job is scheduled: "0 9 * * *" (9 AM UTC daily)

**Note:** Cron jobs require Vercel **Hobby** or **Pro** plan (not free tier)

---

## 📊 Monitor After Deployment

### Resend Dashboard
Check [resend.com/dashboard](https://resend.com/dashboard):
- Email delivery status
- Open rates
- Click rates
- Bounce rates

### Vercel Logs
Check Vercel Dashboard → Functions:
- API request logs
- Cron execution logs
- Error reports

### Supabase
Check Supabase Dashboard → Table Editor:
- `registrations` table
- `events` table (attendee counts)

---

## 🐛 Troubleshooting

### Email Not Sending?
1. Check RESEND_API_KEY is correct
2. Restart dev server
3. Check console for errors
4. Verify email in Resend dashboard

### Reminder Not Working?
1. Event date must be tomorrow
2. User must be registered
3. Check `/api/send-event-reminders` endpoint
4. View terminal output

### Registration Failed?
1. Check Supabase connection
2. Verify database tables exist
3. Check browser console
4. Check network tab for API errors

---

## 📚 Documentation Reference

Detailed guides available:
- **TESTING_CHECKLIST.md** - Complete testing guide
- **AFTER_REGISTRATION_FLOW.md** - Detailed workflow
- **NOTIFICATIONS_SETUP.md** - Email setup guide
- **EVENT_REMINDERS_SETUP.md** - Reminder configuration
- **REGISTRATION_SETUP.md** - Registration system
- **SETUP_GUIDE.md** - Initial setup

---

## 🎉 What's Next?

Once everything is working:

### Immediate:
- ✅ Deploy to production
- ✅ Monitor email deliverability
- ✅ Get user feedback

### Short-term:
- 📅 Add calendar export (Google, iCal)
- 🔔 Multiple reminder times (1 week, 3 days, 1 hour)
- 👤 Enhanced user profiles
- 🔍 Search and filter improvements

### Long-term:
- 💳 Paid events (Stripe integration)
- 📱 Mobile app
- 📊 Analytics dashboard
- 🎫 QR code check-in
- ⭐ Event reviews and ratings

---

## ✨ Success!

You now have a production-ready event management platform! 🚀

Your users can:
- Browse and discover events
- Register with one click
- Receive beautiful email confirmations
- Get automated reminders
- Manage their registrations
- Never miss an event

**Need help? Check the documentation or the console logs!**
