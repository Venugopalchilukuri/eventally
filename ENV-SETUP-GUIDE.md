# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App URL (for password reset redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to: **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## For Production (Vercel)

Add these environment variables in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_APP_URL=https://eventally-5xap.vercel.app
   ```
4. Click **Save**
5. Redeploy your application

## Verification

After setting up environment variables:

1. Restart your development server:
   ```powershell
   npm run dev
   ```

2. Check the browser console - you should NOT see any "Supabase is not configured" warnings

3. Test the password reset flow

## Troubleshooting

### Issue: "Supabase is not configured"
**Solution:** 
- Verify `.env.local` exists in the root directory
- Check that variable names are exactly as shown above
- Restart the dev server after adding variables

### Issue: Variables not loading
**Solution:**
- Make sure the file is named `.env.local` (not `.env` or `.env.development`)
- Check that there are no spaces around the `=` sign
- Restart the dev server

### Issue: Works locally but not on Vercel
**Solution:**
- Add environment variables in Vercel dashboard
- Make sure to redeploy after adding variables
- Check Vercel deployment logs for errors
