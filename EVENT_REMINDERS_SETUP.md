# Automated Event Reminders System

## ✅ What's Been Implemented

Your event platform now automatically sends reminder emails **24 hours before events**!

**Features:**
- 🔔 Automated daily checks for upcoming events
- 📧 Beautiful reminder emails to all registered attendees
- ⏰ Countdown timer showing hours until event
- 📋 Quick checklist for attendees
- 🔐 Secure API endpoint with authentication
- 📊 Detailed logging and reporting

---

## 🚀 How It Works

### Automatic Process:

```
Every day at 9:00 AM:
  ↓
Check for events happening in 24 hours
  ↓
Find all registered users for those events
  ↓
Send beautiful reminder emails to each user
  ↓
Log results and stats
```

### Email Content:

```
Subject: Reminder: [Event Title] is Tomorrow!

⏰ Event Reminder

24 hours until your event

[Event Title]
📅 Date: Monday, November 15, 2025
🕐 Time: 2:00 PM
📍 Location: Conference Center

📝 Quick Checklist:
✓ Check the location
✓ Mark your calendar
✓ Prepare materials

[View Full Details Button]
```

---

## 🔧 Setup Instructions

### Step 1: Environment Variables (Optional)

Add to `.env.local` for security:

```env
# Cron Job Security (Optional but recommended)
CRON_SECRET=your-random-secret-key-here
```

Generate a secure secret:
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use any random string
CRON_SECRET=my-super-secret-cron-key-123
```

### Step 2: Cron Configuration (Already Added)

The `vercel.json` file is already created with:

```json
{
  "crons": [
    {
      "path": "/api/send-event-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule:** `0 9 * * *` = Every day at 9:00 AM UTC

### Step 3: Customize Schedule (Optional)

Edit `vercel.json` to change when reminders are sent:

```json
"schedule": "0 9 * * *"   // 9:00 AM UTC daily
"schedule": "0 */6 * * *" // Every 6 hours
"schedule": "0 8,20 * * *" // 8 AM and 8 PM daily
"schedule": "0 12 * * *"  // 12:00 PM noon daily
```

**Cron format:** `minute hour day month dayOfWeek`

---

## 🧪 Testing (Before Deployment)

### Method 1: Manual API Test

**Test the reminder system manually:**

```bash
# Using curl (Windows PowerShell)
curl http://localhost:3000/api/send-event-reminders

# Using browser
# Just visit: http://localhost:3000/api/send-event-reminders
```

**With CRON_SECRET:**
```bash
curl -H "Authorization: Bearer your-secret-here" http://localhost:3000/api/send-event-reminders
```

### Method 2: Create Test Event

**Quick test setup:**

1. **Create an event for tomorrow**
   - Go to Create Event
   - Set date to tomorrow
   - Set time to current time + 24 hours
   - Save event

2. **Register for the event**
   - Register using your email

3. **Trigger the reminder manually**
   ```
   Visit: http://localhost:3000/api/send-event-reminders
   ```

4. **Check your email**
   - Should receive reminder email immediately

### Method 3: Check Console Logs

When you trigger the reminder, check your terminal:

```bash
🔔 Checking for events requiring reminders...
📅 Looking for events between 2025-11-07 and 2025-11-08
📧 Found 1 event(s) requiring reminders

📌 Processing event: Tech Conference 2025
  👥 Found 2 registered user(s)
    ✅ Sent reminder to user1@example.com
    ✅ Sent reminder to user2@example.com
  ✉️  Sent 2/2 reminder emails

🎉 Reminder job complete! Sent 2 total emails
```

---

## 🌐 Deployment to Vercel

### Step 1: Deploy Your App

```bash
# Push to GitHub
git add .
git commit -m "Add event reminders system"
git push

# Deploy to Vercel
# Connect your GitHub repo to Vercel
# Vercel will automatically detect vercel.json
```

### Step 2: Add Environment Variables in Vercel

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `RESEND_API_KEY` = your Resend API key
   - `CRON_SECRET` = your secret (optional)
   - `NEXT_PUBLIC_APP_URL` = https://yourdomain.com

### Step 3: Enable Cron Jobs

**Vercel automatically enables cron jobs** from `vercel.json`!

You can view them:
1. Go to your project in Vercel
2. Click **Settings** → **Cron Jobs**
3. See your scheduled job running daily at 9 AM UTC

### Step 4: Monitor Cron Executions

**View logs in Vercel:**
1. Go to **Deployments**
2. Click on latest deployment
3. Go to **Functions**
4. Find `/api/send-event-reminders`
5. View execution logs

---

## 📊 API Response Format

### Success Response:

```json
{
  "success": true,
  "message": "Event reminders sent successfully",
  "eventCount": 2,
  "emailsSent": 5,
  "results": [
    {
      "eventId": "abc-123",
      "eventTitle": "Tech Conference 2025",
      "emailsSent": 3,
      "totalRegistrations": 3
    },
    {
      "eventId": "def-456",
      "eventTitle": "Business Meetup",
      "emailsSent": 2,
      "totalRegistrations": 2
    }
  ]
}
```

### No Events Response:

```json
{
  "success": true,
  "message": "No events requiring reminders",
  "eventCount": 0,
  "emailsSent": 0
}
```

### Error Response:

```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Error message here"
}
```

---

## 🎯 How Reminder Logic Works

### Time Window:

The system looks for events happening between **23-25 hours from now**:

```typescript
now = 9:00 AM Nov 6
tomorrow = 8:00 AM Nov 7 (23 hours)
dayAfter = 10:00 AM Nov 7 (25 hours)

// Events with date = Nov 7 will be caught
```

This 2-hour window ensures:
- Events are caught even if cron runs slightly early/late
- No duplicate reminders (events only match once)
- Reliable delivery around 24h mark

### Filtering Process:

```sql
SELECT * FROM events 
WHERE date >= '2025-11-07' 
AND date <= '2025-11-07'
```

Then for each event:

```sql
SELECT user_email FROM registrations 
WHERE event_id = 'event-id'
```

Send email to each registered user.

---

## 🔐 Security Features

### 1. CRON_SECRET Authentication

Prevents unauthorized access:

```typescript
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return 401 Unauthorized
}
```

### 2. Environment Variable Protection

API keys never exposed in code:
- `RESEND_API_KEY` stored in env
- `CRON_SECRET` stored in env
- Both configured in Vercel settings

### 3. Rate Limiting

100ms delay between emails to avoid spam flags:

```typescript
await new Promise(resolve => setTimeout(resolve, 100));
```

---

## 📅 Cron Schedule Examples

### Common Schedules:

```json
// Every day at 9 AM UTC
"schedule": "0 9 * * *"

// Every day at 6 AM and 6 PM UTC
"schedule": "0 6,18 * * *"

// Every 12 hours
"schedule": "0 */12 * * *"

// Every Monday at 9 AM
"schedule": "0 9 * * 1"

// First day of month at 9 AM
"schedule": "0 9 1 * *"
```

### Time Zone Considerations:

Vercel cron runs in **UTC**. Convert your local time:

- 9 AM UTC = 2:30 PM IST (India)
- 9 AM UTC = 1 AM PST (California)
- 9 AM UTC = 10 AM CET (Europe)

**To send at 9 AM IST (3:30 AM UTC):**
```json
"schedule": "30 3 * * *"
```

---

## 🐛 Troubleshooting

### Reminders Not Sending:

**1. Check Event Dates**
```bash
# Events must be exactly tomorrow
# If today is Nov 6, event date should be Nov 7
```

**2. Verify Registrations**
```bash
# Users must be registered for the event
# Check in Supabase registrations table
```

**3. Check Logs**
```bash
# Visit API endpoint manually
http://localhost:3000/api/send-event-reminders

# Check terminal output
```

**4. Verify Email Service**
```bash
# Make sure RESEND_API_KEY is set
# Check Resend dashboard for delivery logs
```

### Duplicate Emails:

If users receive multiple reminders:

**Solution 1:** Add reminder tracking

Create a `reminders_sent` table:
```sql
CREATE TABLE reminders_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id),
  user_id UUID,
  sent_at TIMESTAMP DEFAULT NOW()
);
```

**Solution 2:** Adjust time window
```typescript
// Make window narrower (23.5-24.5 hours)
tomorrow.setHours(tomorrow.getHours() + 23.5);
dayAfter.setHours(dayAfter.getHours() + 24.5);
```

### Cron Not Running on Vercel:

**Check:**
1. `vercel.json` is in root directory
2. Cron jobs enabled in project settings
3. View logs in Vercel dashboard
4. Ensure you're on Vercel Pro plan (required for crons)

**Note:** Vercel cron jobs require **Hobby or Pro plan** (not free tier)

---

## 💡 Advanced Features (Future Enhancements)

### 1. Multiple Reminder Times

Send reminders at different intervals:
- 1 week before
- 3 days before
- 24 hours before
- 1 hour before

### 2. User Preferences

Let users choose reminder timing:
```typescript
user_preferences {
  reminder_1week: true,
  reminder_24h: true,
  reminder_1h: false
}
```

### 3. SMS Reminders

Add Twilio integration for SMS:
```typescript
import twilio from 'twilio';
await client.messages.create({
  body: 'Event reminder: Tech Conference tomorrow!',
  to: userPhone,
  from: twilioNumber
});
```

### 4. Reminder History

Track all sent reminders:
```sql
CREATE TABLE reminder_history (
  event_id, user_id, sent_at, reminder_type
)
```

---

## ✅ Testing Checklist

Before going live:

- [ ] Create test event for tomorrow
- [ ] Register for the event
- [ ] Trigger reminder API manually
- [ ] Check email received
- [ ] Verify email formatting
- [ ] Test with multiple registrations
- [ ] Check console logs
- [ ] Verify no duplicate sends
- [ ] Test with invalid dates
- [ ] Deploy to Vercel
- [ ] Verify cron job scheduled
- [ ] Monitor first automated run

---

## 📊 Monitoring & Analytics

### Track Reminder Effectiveness:

**Metrics to monitor:**
- Email delivery rate
- Open rate (in Resend dashboard)
- Click-through rate on "View Details" button
- Event attendance after reminders

**Resend Dashboard:**
- View all sent emails
- Check delivery status
- Monitor bounce/spam rates
- See open/click rates

---

## 🎉 You're All Set!

Your event reminder system is now:
- ✅ Automatically checking daily
- ✅ Sending beautiful reminder emails
- ✅ Tracking all registered users
- ✅ Ready for production deployment

### Quick Start:

1. **Test locally:**
   ```
   Visit: http://localhost:3000/api/send-event-reminders
   ```

2. **Deploy to Vercel:**
   ```bash
   git push
   # Vercel auto-deploys
   ```

3. **Add environment variables in Vercel**

4. **Monitor cron executions in dashboard**

---

## 🔗 Resources

- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru)
- [Resend Email API](https://resend.com/docs)

**Your users will never miss an event! 🎊📧⏰**
