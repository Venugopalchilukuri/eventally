# Event Registration System Setup

## 🎯 What This Adds

Users can now:
- **Register/RSVP** for events they want to attend
- **View their registrations** on a dedicated page
- **Unregister** from events
- **See attendee count** update in real-time

Event creators can:
- **See who registered** for their events
- **View attendee list** with emails
- **Track registration numbers**

---

## 🔧 Database Setup Required

### Step 1: Create Registrations Table

1. Go to **Supabase Dashboard**
2. Click **SQL Editor**
3. Click **"New query"**
4. Copy and paste this SQL:

```sql
-- Create registrations table
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_email TEXT NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Allow users to view registrations for events they created
CREATE POLICY "Event creators can view registrations" ON registrations
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events WHERE user_id = auth.uid()
    )
  );

-- Allow users to view their own registrations
CREATE POLICY "Users can view own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to register for events
CREATE POLICY "Users can register for events" ON registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to unregister from events
CREATE POLICY "Users can unregister from events" ON registrations
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX registrations_event_id_idx ON registrations(event_id);
CREATE INDEX registrations_user_id_idx ON registrations(user_id);

-- Function to update event attendee count
CREATE OR REPLACE FUNCTION update_event_attendees()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE events
    SET current_attendees = current_attendees + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE events
    SET current_attendees = GREATEST(current_attendees - 1, 0)
    WHERE id = OLD.event_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update attendee count
CREATE TRIGGER update_attendees_on_registration
AFTER INSERT OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION update_event_attendees();
```

5. Click **"Run"**
6. You should see "Success"

---

## ✨ New Features

### For All Users:
- **RSVP Button** on each event card
- **"My Registrations"** page to see events you're attending
- **Unregister** button to cancel attendance
- **Real-time attendee count** updates

### For Event Creators:
- **Attendee List** on "My Events" page
- **See who registered** with their emails
- **Registration count** for each event

---

## 🚀 How to Use

### As a Regular User:

1. **Browse Events**: Go to http://localhost:3000/events
2. **Click "Register"** on any event you want to attend
3. **View Your Registrations**: Click "My Registrations" in navigation
4. **Unregister**: Click "Unregister" if you can't attend

### As Event Creator:

1. **Go to "My Events"**: http://localhost:3000/my-events
2. **Click "View Attendees"** on your event
3. **See the list** of registered users with emails

---

## 📊 Features Added

- ✅ RSVP/Register button on event cards
- ✅ "My Registrations" page
- ✅ Unregister functionality
- ✅ Attendee list for event creators
- ✅ Real-time attendee count updates
- ✅ Prevent duplicate registrations
- ✅ Check max capacity before registering

---

## 🔒 Security

- Users can only register themselves
- Users can only unregister themselves
- Event creators can see who registered for their events
- Automatic cleanup when events are deleted
- Unique constraint prevents duplicate registrations

---

## 🎨 UI Updates

- New "Register" button on event cards
- "Registered" badge for events you're attending
- "My Registrations" link in navigation
- Attendee count shows on all events
- Full/Available status for events with max capacity

---

Run the SQL above and you're ready to go! 🚀
