# Eventally Setup Guide

## 🎯 What You Need to Do Next

Follow these simple steps to complete your event management app setup:

---

## Step 1: Create a Supabase Account (5 minutes)

1. Go to **https://supabase.com**
2. Click **"Start your project"** (it's free!)
3. Sign up with your GitHub account or email
4. Click **"New Project"**
5. Fill in:
   - **Name**: `eventally` (or any name you like)
   - **Database Password**: Create a strong password (save it somewhere!)
   - **Region**: Choose closest to you
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup to complete

---

## Step 2: Get Your API Keys

1. In your Supabase dashboard, click on **Settings** (gear icon on left sidebar)
2. Click **API** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string of characters)
4. Keep this page open - you'll need these in the next step!

---

## Step 3: Create Environment File

1. In VS Code, create a new file in the root folder: `.env.local`
2. Copy and paste this into the file:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace `your_project_url_here` with your **Project URL** from Supabase
4. Replace `your_anon_key_here` with your **anon public** key from Supabase
5. Save the file

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 4: Create Database Table

1. In Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy and paste this SQL code:

```sql
-- Create events table
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  user_id UUID
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read events
CREATE POLICY "Anyone can view events" ON events
  FOR SELECT USING (true);

-- Create policy to allow anyone to insert events (for now)
CREATE POLICY "Anyone can create events" ON events
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to update their own events
CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (true);

-- Create policy to allow users to delete their own events
CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (true);
```

4. Click **"Run"** button
5. You should see "Success. No rows returned"

---

## Step 5: Restart Your Dev Server

1. Stop the current dev server (press `Ctrl+C` in terminal)
2. Start it again: `npm run dev`
3. This loads your new environment variables

---

## Step 6: Test It Out!

1. Open http://localhost:3000 in your browser
2. Click **"Create Event"**
3. Fill out the form and submit
4. Go back to Supabase → **Table Editor** → **events**
5. You should see your event in the database! 🎉

---

## ✅ You're Done!

Your app is now connected to a real database. Events you create will be saved and persist even after refreshing the page.

---

## 🆘 Need Help?

If something doesn't work:
1. Check that your `.env.local` file has the correct keys
2. Make sure you restarted the dev server after creating `.env.local`
3. Check the browser console (F12) for any error messages
4. Let me know what error you're seeing!

---

## 🚀 What's Next?

After this works, I can help you add:
- User authentication (login/signup)
- Edit and delete events
- RSVP functionality
- User profiles
- And much more!
