# Admin Dashboard Setup Guide

## 🔧 Database Setup Required

Before using the admin dashboard, you need to create a profiles table and set up admin roles.

### Step 1: Create Profiles Table in Supabase

1. Go to **Supabase Dashboard**
2. Click **SQL Editor** (left sidebar)
3. Click **"New query"**
4. Copy and paste this SQL:

```sql
-- Create profiles table to store user roles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create a function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

5. Click **"Run"**
6. You should see "Success"

---

### Step 2: Make Yourself an Admin

Now let's make your account an admin:

1. Still in **SQL Editor**, create a new query
2. **Replace `your-email@example.com` with YOUR actual email**
3. Copy and paste this SQL:

```sql
-- Make a user an admin (replace with your email)
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

4. Click **"Run"**
5. You should see "Success. 1 row(s) affected"

---

### Step 3: Verify Admin Status

Check if it worked:

```sql
-- Check your admin status
SELECT * FROM profiles WHERE email = 'your-email@example.com';
```

You should see your profile with `role: 'admin'`

---

## 🎯 How to Access Admin Dashboard

1. **Sign in** to your account (the one you made admin)
2. Go to: **http://localhost:3000/admin**
3. You'll see the admin dashboard!

---

## 🛡️ Admin Features

### Dashboard Overview
- **Total Events** - Count of all events in the system
- **Total Users** - Number of registered users
- **Recent Events** - Latest events created
- **User Activity** - Recent signups

### Event Management
- View all events from all users
- Delete any event
- See event creator information
- Filter and search events

### User Management
- View all registered users
- See user roles (admin/user)
- View user email and signup date
- Promote users to admin
- Demote admins to regular users

### Statistics
- Total events count
- Total users count
- Events by category breakdown
- Recent activity timeline

---

## 🔒 Security Features

- **Protected route** - Only admins can access `/admin`
- **Role-based access** - Checks user role from database
- **Automatic redirect** - Non-admins redirected to home
- **Secure operations** - All admin actions verified server-side

---

## 👥 Managing Other Admins

To make another user an admin:

1. Go to **Supabase → SQL Editor**
2. Run this query (replace email):

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'other-user@example.com';
```

To remove admin privileges:

```sql
UPDATE profiles
SET role = 'user'
WHERE email = 'user-to-demote@example.com';
```

---

## 🚀 What's Next?

You can extend the admin dashboard with:
- **Analytics charts** - Event trends over time
- **Email notifications** - Send announcements to all users
- **Event approval system** - Review events before publishing
- **User banning** - Suspend problematic users
- **Bulk operations** - Delete multiple events at once
- **Export data** - Download reports as CSV

---

## 🐛 Troubleshooting

**"Access Denied" when visiting /admin**
- Make sure you ran the SQL to make yourself admin
- Check your email matches exactly (case-sensitive)
- Sign out and sign back in to refresh your session

**"Profiles table doesn't exist"**
- Run the first SQL query to create the profiles table
- Make sure it completed successfully

**Can't see admin link in navigation**
- The admin link only shows for users with admin role
- Sign out and sign back in after making yourself admin

---

## ✨ You're Ready!

Once you complete the database setup, you'll have a powerful admin dashboard to manage your entire platform!
