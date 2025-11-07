# Email Notifications System

## ✅ What's Been Implemented

Your event platform now has a complete email notification system:
- **Registration Confirmations** - Instant email when users register
- **Beautiful Email Templates** - Professional HTML emails
- **Email Reminders** - Ready for automated event reminders
- **Cancellation Emails** - Template ready for unregister notifications

---

## 🚀 Quick Setup Guide

### Step 1: Install Resend Package

Run this command in your terminal:
```bash
npm install resend
```

### Step 2: Get Your Resend API Key

1. Go to [Resend.com](https://resend.com) and sign up (FREE tier available)
2. Verify your email
3. Go to **API Keys** in the dashboard
4. Click **"Create API Key"**
5. Copy your API key (starts with `re_`)

### Step 3: Add Environment Variables

Add these to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Eventally <onboarding@resend.dev>

# App URL (for email links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Production:**
```env
RESEND_FROM_EMAIL=Eventally <noreply@yourdomain.com>
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 4: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

### Step 5: Test Email Notifications

1. Register for an event
2. Check your email inbox
3. You should receive a beautiful confirmation email!

---

## 📧 Email Templates Included

### 1. Registration Confirmation Email

**Triggered:** When a user registers for an event

**Features:**
- ✅ Success badge with checkmark
- 📅 Event date, time, and location
- 🔗 "View Event Details" button
- 💡 Pro tip section
- 🎨 Gradient design matching your brand
- 📱 Mobile responsive

**Preview:**
```
Subject: Registration Confirmed: [Event Title]

✓ Registration Confirmed
You're All Set, [User]!

[Event Title]
📅 Date: Monday, November 15, 2025
🕐 Time: 2:00 PM
📍 Location: Conference Center

[View Event Details Button]
```

### 2. Event Reminder Email

**Triggered:** 24 hours before event (ready for automation)

**Features:**
- ⏰ Countdown timer
- 📋 Quick checklist
- 🎯 Event details
- 🔗 View full details link
- 📝 Event description

**Preview:**
```
Subject: Reminder: [Event Title] is Tomorrow!

⏰ Event Reminder

24 hours until your event

[Event Title]
[Event Details]
[View Full Details Button]

Quick Checklist:
✓ Check the location
✓ Mark your calendar
✓ Prepare materials
```

### 3. Cancellation Email

**Triggered:** When user unregisters (template ready)

**Features:**
- Simple confirmation
- Browse events link
- Clean design

---

## 🎨 Email Design Features

### Visual Elements:
- **Gradient Logo** - Purple to blue matching your brand
- **Status Badges** - Color-coded for different email types
- **Responsive Layout** - Perfect on mobile and desktop
- **Professional Typography** - Clean, readable fonts
- **CTA Buttons** - Eye-catching gradient buttons
- **Info Cards** - Organized event details
- **Footer Links** - Manage registrations, browse events

### Brand Colors:
- Primary: Purple (#9333ea)
- Secondary: Blue (#2563eb)
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)

---

## 🔧 How It Works

### Registration Flow:

1. **User registers for event**
   ```typescript
   registerForEvent(eventId, userId, userEmail)
   ```

2. **Registration saved to database**
   ```sql
   INSERT INTO registrations (event_id, user_id, user_email)
   ```

3. **Email API called (non-blocking)**
   ```typescript
   fetch('/api/send-registration-email', {
     method: 'POST',
     body: JSON.stringify({
       userEmail, eventTitle, eventDate, ...
     })
   })
   ```

4. **Email sent via Resend**
   ```typescript
   sendEmail({ to, subject, html })
   ```

5. **User receives confirmation**
   - Immediate email delivery
   - Doesn't block registration flow
   - Fails gracefully if email service is down

---

## 📋 Email API Routes

### `/api/send-registration-email`

**Method:** POST

**Request Body:**
```json
{
  "userEmail": "user@example.com",
  "userName": "John",
  "eventTitle": "Tech Conference 2025",
  "eventDate": "2025-11-15",
  "eventTime": "14:00",
  "eventLocation": "Conference Center",
  "eventId": "event-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

**Error Response:**
```json
{
  "error": "Failed to send email",
  "details": "Error message"
}
```

---

## 🔐 Security & Privacy

### Email Protection:
- ✅ Email addresses never exposed in client code
- ✅ API routes validate all inputs
- ✅ Emails sent server-side only
- ✅ No spam - only transactional emails
- ✅ Unsubscribe links in footer

### API Key Security:
- ✅ Stored in environment variables
- ✅ Never committed to version control
- ✅ Different keys for dev/production
- ✅ Server-side only usage

---

## 🎯 Testing Emails

### Development Mode:

Without API key (emails logged to console):
```bash
# .env.local without RESEND_API_KEY
RESEND_FROM_EMAIL=Eventally <dev@example.com>
```

Emails will be logged:
```
Email would be sent to: user@example.com
Subject: Registration Confirmed: Tech Conference
```

### With Resend API Key:

1. Add your API key to `.env.local`
2. Register for an event
3. Check your email inbox
4. Email arrives in ~2 seconds

### Test with Different Email Providers:
- ✅ Gmail
- ✅ Outlook
- ✅ Yahoo
- ✅ Custom domain emails
- ✅ Mobile email clients

---

## 🚀 Advanced Features (Future Enhancement)

### Event Reminders Automation:

You can set up automated reminders using:

**Option 1: Cron Jobs**
```typescript
// Create a cron job to check upcoming events
// Send reminder emails 24 hours before
```

**Option 2: Supabase Functions**
```sql
-- Schedule function to send reminders
```

**Option 3: Vercel Cron Jobs**
```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/send-reminders",
    "schedule": "0 9 * * *"
  }]
}
```

### Batch Email Sending:

For event creators to notify all attendees:
```typescript
// Future feature: Broadcast to all attendees
POST /api/broadcast-event-update
{
  eventId,
  subject,
  message
}
```

---

## 📱 Email Customization

### Change Email Styling:

Edit `/src/lib/email.ts`:

```typescript
// Update colors
const primaryColor = '#9333ea';
const gradientStart = '#9333ea';
const gradientEnd = '#2563eb';

// Update fonts
font-family: 'Your-Font', sans-serif;

// Add your logo
<img src="https://your-cdn.com/logo.png" />
```

### Add More Template Variables:

```typescript
export function getRegistrationConfirmationEmail(
  userName,
  eventTitle,
  // Add new parameter
  organizerName
) {
  // Use in template
  <p>Organized by: ${organizerName}</p>
}
```

---

## 🐛 Troubleshooting

### Email Not Sending:

1. **Check API Key**
   ```bash
   echo $RESEND_API_KEY
   # Should start with 're_'
   ```

2. **Verify Environment Variables**
   - Restart dev server after adding variables
   - Check `.env.local` file exists

3. **Check Console Logs**
   ```bash
   # Look for email errors in terminal
   Email notification failed: ...
   ```

4. **Test API Route Directly**
   ```bash
   curl -X POST http://localhost:3000/api/send-registration-email \
     -H "Content-Type: application/json" \
     -d '{"userEmail":"test@example.com", ...}'
   ```

### Email Goes to Spam:

1. **Use Verified Domain** (Resend Pro)
   - Add your domain to Resend
   - Update `RESEND_FROM_EMAIL`

2. **Check Email Content**
   - Avoid spam trigger words
   - Include unsubscribe link

3. **Warm Up Domain**
   - Send gradually increasing volume
   - Monitor deliverability

### Template Not Rendering:

1. **Check HTML Syntax**
   - Validate HTML in email template
   - Test with email preview tools

2. **Test in Different Clients**
   - Gmail, Outlook, Apple Mail
   - Use Litmus or Email on Acid

---

## 📊 Email Analytics (Resend Dashboard)

View in Resend dashboard:
- 📈 Delivery rate
- 📧 Open rate
- 🔗 Click rate
- ❌ Bounce rate
- 📉 Spam complaints

---

## ✨ Email Best Practices

### Do's:
- ✅ Use descriptive subject lines
- ✅ Include event details clearly
- ✅ Add CTA buttons
- ✅ Make emails mobile-responsive
- ✅ Include unsubscribe option
- ✅ Test before sending

### Don'ts:
- ❌ Send too frequently
- ❌ Use misleading subject lines
- ❌ Include broken links
- ❌ Forget to test on mobile
- ❌ Use all caps or excessive emojis
- ❌ Send from no-reply@ without alternative

---

## 🎉 You're All Set!

Your event platform now has:
- ✅ Professional email notifications
- ✅ Registration confirmations
- ✅ Beautiful HTML templates
- ✅ Mobile-responsive design
- ✅ Brand-consistent styling
- ✅ Ready for automation

### Quick Start Checklist:
- [ ] Install Resend package (`npm install resend`)
- [ ] Sign up for Resend account
- [ ] Get API key
- [ ] Add to `.env.local`
- [ ] Restart dev server
- [ ] Test by registering for an event
- [ ] Check your email!

### Production Checklist:
- [ ] Get Resend Pro (for custom domain)
- [ ] Add verified domain
- [ ] Update `RESEND_FROM_EMAIL`
- [ ] Set `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Test email deliverability
- [ ] Monitor email analytics

---

## 🔗 Resources

- [Resend Documentation](https://resend.com/docs)
- [Email Template Guide](https://really-good-emails.com)
- [HTML Email Best Practices](https://www.campaignmonitor.com/dev-resources/guides/coding/)
- [Email Deliverability Tips](https://postmarkapp.com/guides/email-deliverability)

Happy emailing! 📧✨
