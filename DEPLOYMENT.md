# Deploying Eventally to Vercel

This guide will help you deploy your Eventally application to Vercel with all features enabled.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A [Supabase account](https://supabase.com) with a project set up
3. Email service configured (Gmail or Resend)

## Required Environment Variables

You'll need to configure these environment variables in your Vercel project settings:

### Supabase Configuration (Required)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these from your Supabase project dashboard under Settings > API.

### Application URL (Required)
```
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

This will be your Vercel deployment URL. Update this after your first deployment.

### Email Service Configuration (Choose One)

#### Option 1: Gmail (FREE - Recommended for getting started)
```
EMAIL_SERVICE=gmail
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password
```

**Setting up Gmail App Password:**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security > 2-Step Verification > App passwords
4. Generate a new app password for "Mail"
5. Use the 16-character password generated

#### Option 2: Resend (Requires domain verification)
```
EMAIL_SERVICE=resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

Get your Resend API key from [resend.com](https://resend.com).

## Supabase Database Setup

Make sure your Supabase database has the following tables set up:

### 1. Events Table
```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 2. Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 3. Registrations Table
```sql
CREATE TABLE registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(event_id, user_id)
);
```

### 4. Comments Table
```sql
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 5. Comment Likes Table
```sql
CREATE TABLE comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(comment_id, user_id)
);
```

### 6. User Interests Table
```sql
CREATE TABLE user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  interest_level INTEGER DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, category)
);
```

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy via GitHub (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure the environment variables in the Vercel dashboard
6. Click "Deploy"

### 3. Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### 4. Configure Environment Variables in Vercel Dashboard

1. Go to your project in Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add all the required environment variables listed above
4. Redeploy your application

### 5. Enable Vercel Cron Jobs

The application uses Vercel Cron Jobs for sending event reminders. The cron job is already configured in `vercel.json`:

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

This runs daily at 9 AM UTC to send reminders for events happening in the next 24 hours.

**Note:** Cron jobs are only available on Vercel Pro plans and above. For the Hobby plan, you can use alternative solutions like:
- External cron services (e.g., cron-job.org)
- Vercel's free edge config with manual triggers

## Post-Deployment Steps

### 1. Update NEXT_PUBLIC_APP_URL

After your first deployment, update the `NEXT_PUBLIC_APP_URL` environment variable with your actual Vercel URL:

```
NEXT_PUBLIC_APP_URL=https://your-actual-deployment-url.vercel.app
```

Then redeploy the application.

### 2. Configure Supabase Auth Redirect URLs

In your Supabase dashboard:
1. Go to Authentication > URL Configuration
2. Add your Vercel URL to the Site URL field
3. Add the following redirect URLs:
   - `https://your-app-name.vercel.app/auth/callback`
   - `https://your-app-name.vercel.app/**`

### 3. Test All Features

After deployment, test the following features:
- ✅ User authentication (signup, login, logout)
- ✅ Event creation and management
- ✅ Event registration and unregistration
- ✅ Email notifications (registration confirmations)
- ✅ Comments and likes
- ✅ AI-powered recommendations
- ✅ Event reminders (if using Pro plan)

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Check that all environment variables are set correctly
2. Ensure your Node.js version is compatible (18.x or higher)
3. Review the build logs in Vercel dashboard

### Email Not Sending

1. Verify your email service credentials are correct
2. For Gmail: Ensure App Password is generated and 2FA is enabled
3. For Resend: Verify your domain is verified
4. Check the Vercel function logs for error messages

### Database Connection Issues

1. Verify Supabase URL and anon key are correct
2. Check that your Supabase project is active
3. Ensure RLS (Row Level Security) policies are properly configured

### Cron Jobs Not Running

1. Verify you're on a Vercel plan that supports cron jobs
2. Check the cron job logs in Vercel dashboard
3. Ensure the API route `/api/send-event-reminders` is accessible

## Features Included in Deployment

✅ **Core Features:**
- User authentication and profiles
- Event creation, editing, and deletion
- Event browsing with search and filters
- Event registration system
- Real-time attendee tracking

✅ **Advanced Features:**
- AI-powered event recommendations
- Comments and social interactions
- Email notifications (registration, reminders, cancellations)
- Event reminders (24 hours before events)
- Personalized user dashboard
- Dark mode support
- Responsive design for all devices

✅ **Performance & SEO:**
- Server-side rendering with Next.js
- Optimized images and assets
- Fast page loads with edge caching
- SEO-friendly URLs and metadata

## Monitoring & Analytics

After deployment, consider setting up:
- Vercel Analytics for performance monitoring
- Supabase Studio for database monitoring
- Error tracking with Sentry or similar service

## Scaling Considerations

As your user base grows:
- Monitor Vercel function execution times
- Optimize database queries
- Consider implementing caching strategies
- Review and upgrade Vercel/Supabase plans as needed

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Check Next.js documentation: https://nextjs.org/docs
- Check Supabase documentation: https://supabase.com/docs

---

**Happy Deploying! 🚀**
