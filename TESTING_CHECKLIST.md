# Testing Checklist - Event Registration Flow

## 🧪 Complete User Journey Test

### Phase 1: Setup ✅
- [ ] Environment variables configured in `.env.local`
- [ ] Resend API key added
- [ ] Dev server restarted (`npm run dev`)
- [ ] Database tables created (events, registrations, user_profiles)

---

### Phase 2: User Registration Flow

#### Test 1: Register for an Event
1. [ ] Go to http://localhost:3000/events
2. [ ] Find an event and click "Register" button
3. [ ] Verify registration button changes to "Registered"
4. [ ] Check attendee count increases

**Expected Result:**
- ✅ Registration saved to database
- ✅ Email confirmation sent immediately
- ✅ User sees success message

#### Test 2: Email Confirmation
1. [ ] Check your email inbox (use your actual email)
2. [ ] Verify you received "Registration Confirmed" email
3. [ ] Check email formatting and styling
4. [ ] Click "View Event Details" button

**Expected Result:**
- ✅ Beautiful HTML email received
- ✅ Event details displayed correctly
- ✅ Links work properly

#### Test 3: My Registrations Page
1. [ ] Click "My Registrations" in navigation
2. [ ] Verify your registered event appears
3. [ ] Check event details are correct
4. [ ] Try "Unregister" button

**Expected Result:**
- ✅ All registered events shown
- ✅ Event information accurate
- ✅ Can unregister successfully

---

### Phase 3: Event Reminders

#### Test 4: Create Test Event for Tomorrow
1. [ ] Go to "Create Event"
2. [ ] Set date to **tomorrow**
3. [ ] Set time to current time + 24 hours
4. [ ] Fill other details and save
5. [ ] Register for this event

**Example:**
- If today is Nov 7, 2025 at 2:00 PM
- Create event for Nov 8, 2025 at 2:00 PM

#### Test 5: Trigger Reminder Manually
1. [ ] Open new browser tab
2. [ ] Visit: http://localhost:3000/api/send-event-reminders
3. [ ] Check terminal/console output
4. [ ] Check your email inbox

**Expected Result:**
```
🔔 Checking for events requiring reminders...
📅 Looking for events between 2025-11-08 and 2025-11-08
📧 Found 1 event(s) requiring reminders

📌 Processing event: Tech Conference 2025
  👥 Found 1 registered user(s)
    ✅ Sent reminder to your@email.com
  ✉️  Sent 1/1 reminder emails

🎉 Reminder job complete! Sent 1 total emails
```

#### Test 6: Verify Reminder Email
1. [ ] Check email inbox
2. [ ] Verify "Reminder: [Event] is Tomorrow!" email
3. [ ] Check countdown timer shows correct hours
4. [ ] Verify all event details are correct
5. [ ] Click "View Full Details" button

**Expected Result:**
- ✅ Reminder email received
- ✅ Countdown shows ~24 hours
- ✅ Beautiful formatting with checklist
- ✅ All links work

---

### Phase 4: Advanced Tests

#### Test 7: Multiple Registrations
1. [ ] Register for 3-4 different events
2. [ ] Go to "My Registrations"
3. [ ] Verify all events shown
4. [ ] Try unregistering from one

#### Test 8: Event Creator View
1. [ ] Create your own event
2. [ ] Have another user register (or use different email)
3. [ ] Go to "My Events"
4. [ ] Check if you can see attendees

#### Test 9: Capacity Limits
1. [ ] Create event with max_attendees = 2
2. [ ] Register yourself
3. [ ] Have someone else register
4. [ ] Try registering a third person

**Expected Result:**
- ✅ Shows "FULL" when capacity reached
- ✅ Prevents over-registration

---

### Phase 5: Edge Cases

#### Test 10: Duplicate Registration Prevention
1. [ ] Register for an event
2. [ ] Try registering again
3. [ ] Verify error message

#### Test 11: Unregister and Re-register
1. [ ] Register for an event
2. [ ] Unregister
3. [ ] Register again
4. [ ] Verify it works

#### Test 12: No Email Service
1. [ ] Remove RESEND_API_KEY from .env.local
2. [ ] Restart server
3. [ ] Register for event
4. [ ] Check console logs

**Expected Result:**
- ✅ Registration still works
- ✅ Console shows: "Email would be sent to: [email]"
- ✅ No errors thrown

---

## 🚀 Production Deployment Checklist

### Before Deploying:
- [ ] All local tests passing
- [ ] Email notifications working
- [ ] Event reminders tested
- [ ] Environment variables ready for production

### Deploy to Vercel:
1. [ ] Push code to GitHub
2. [ ] Connect repo to Vercel
3. [ ] Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (production URL)
   - `CRON_SECRET` (optional)
4. [ ] Verify cron job is scheduled (Settings → Cron Jobs)
5. [ ] Test live site

### Post-Deployment:
- [ ] Create test event on production
- [ ] Register and verify email
- [ ] Monitor cron job logs in Vercel
- [ ] Check first automated reminder (next day at 9 AM UTC)

---

## 📊 Monitoring

### Check These Regularly:
- **Resend Dashboard**: Email delivery rates, open rates
- **Vercel Logs**: Cron job executions, API errors
- **Supabase**: Database queries, registrations table
- **User Feedback**: Are users receiving emails?

---

## 🐛 Common Issues

### Email Not Sending:
- ✅ Restart dev server after adding RESEND_API_KEY
- ✅ Check API key is correct (starts with `re_`)
- ✅ Verify RESEND_FROM_EMAIL format

### Reminder Not Triggering:
- ✅ Event date must be exactly tomorrow
- ✅ User must be registered
- ✅ Check console output when visiting API endpoint

### Cron Job Not Running on Vercel:
- ✅ Requires Vercel Hobby/Pro plan (not free tier)
- ✅ Verify `vercel.json` is in root directory
- ✅ Check Vercel dashboard → Settings → Cron Jobs

---

## ✅ Success Criteria

You know everything is working when:
1. ✅ Users can register/unregister smoothly
2. ✅ Confirmation emails arrive within seconds
3. ✅ "My Registrations" page shows all events
4. ✅ Reminder emails sent 24h before events
5. ✅ No errors in console/logs
6. ✅ Cron job runs daily on production

---

## 📈 Next Features to Add (Optional)

After registration system is solid:
1. **User Profiles** - View other attendees' profiles
2. **Calendar Integration** - Add to Google Calendar, iCal
3. **Social Sharing** - Share events on social media
4. **Event Categories** - Filter by category
5. **Search Functionality** - Search for specific events
6. **Admin Dashboard** - Manage all events and users
7. **Analytics** - Track popular events, attendance rates
8. **Payment Integration** - Paid events with Stripe
9. **QR Code Check-in** - Scan codes at event entrance
10. **Event Reviews** - Rate and review past events

---

**Ready to test? Start with Phase 1! 🚀**
