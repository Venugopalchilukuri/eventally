# Environment Variables for Vercel Deployment

## Copy these to your Vercel project settings after deployment

### Required Variables

```bash
# Supabase Configuration (Get from Supabase Dashboard > Settings > API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Application URL (Update after first deployment)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
```

### Email Service (Choose ONE option)

#### Option A: Gmail (FREE - No domain needed)
```bash
EMAIL_SERVICE=gmail
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
```

#### Option B: Resend (Requires domain)
```bash
EMAIL_SERVICE=resend
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

## Quick Setup Instructions:

1. Deploy first (run: vercel --prod)
2. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
3. Add all variables above
4. Update NEXT_PUBLIC_APP_URL with your actual Vercel URL
5. Redeploy (run: vercel --prod again)

## Gmail App Password Setup:
1. Go to myaccount.google.com
2. Security > 2-Step Verification (enable if not enabled)
3. Security > App passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password
