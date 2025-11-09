# 🚀 Deployment Checklist - Eventally

## ✅ Before You Deploy

### **1. Environment Variables Ready?**
You'll need these in Vercel:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `CRON_SECRET` (for email reminders)

### **2. Supabase Setup Complete?**
- [ ] All tables created
- [ ] RLS policies enabled
- [ ] event_likes table created
- [ ] event_comments table created
- [ ] Test data exists (at least 3-5 events)

### **3. Git Repository Ready?**
- [ ] Code committed to Git
- [ ] .env.local NOT committed (gitignored)
- [ ] No sensitive data in code

### **4. App Tested Locally?**
- [ ] Homepage works
- [ ] Can create events
- [ ] Can register for events
- [ ] Can like events
- [ ] Can comment on events
- [ ] Email notifications work

---

## 🚀 Deployment Steps

### **Method 1: Deploy via Vercel Dashboard (Easiest)**

#### **Step 1: Push to GitHub**
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Eventally ready for deployment"

# Create GitHub repo and push
# (Create repo at github.com first)
git remote add origin https://github.com/YOUR_USERNAME/eventally.git
git branch -M main
git push -u origin main
```

#### **Step 2: Deploy on Vercel**
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all 4 variables from `.env.local`
   - Copy values from your local `.env.local` file

6. Click "Deploy"
7. Wait 2-3 minutes
8. Your app will be live! 🎉

---

### **Method 2: Deploy via Vercel CLI (Advanced)**

#### **Step 1: Install Vercel CLI**
```bash
npm install -g vercel
```

#### **Step 2: Login**
```bash
vercel login
```

#### **Step 3: Deploy**
```bash
# From your project directory
cd c:\Users\venug\Downloads\eventally

# Deploy (production)
vercel --prod
```

The CLI will:
- Ask you to confirm project settings
- Ask for environment variables
- Build and deploy your app
- Give you a live URL

---

## ⚙️ Environment Variables Setup

### **In Vercel Dashboard:**

1. Go to your project → Settings → Environment Variables

2. Add these variables:

**NEXT_PUBLIC_SUPABASE_URL**
```
https://YOUR_PROJECT_ID.supabase.co
```

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Your anon/public key from Supabase
```

**RESEND_API_KEY**
```
re_xxxxxxxxxxxxx (from resend.com)
```

**CRON_SECRET**
```
any-random-secure-string-here
```

3. Click "Save" after each variable

---

## 🔐 Security Check

### **Before deploying, verify:**
- [ ] `.env.local` is in `.gitignore` ✅
- [ ] No API keys in code ✅
- [ ] Supabase RLS is enabled ✅
- [ ] All sensitive data is in env variables ✅

---

## 🧪 Post-Deployment Testing

### **After deployment, test:**

1. **Visit your live URL**
   - Homepage loads?
   - Events show?

2. **Test Core Features**
   - Create an account
   - Create an event
   - Register for an event
   - Like an event
   - Comment on an event

3. **Test Email**
   - Register for an event
   - Check if email arrives
   - Check spam folder if not

4. **Test Mobile**
   - Open on phone
   - Check responsive design
   - Test all features

---

## 🐛 Troubleshooting

### **Build Errors?**
- Check Vercel build logs
- Look for TypeScript errors
- Check for missing dependencies

### **App Loads but Features Don't Work?**
- Check environment variables are set
- Check Supabase connection
- Check browser console for errors

### **Emails Not Sending?**
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for logs
- Verify email domain is verified

### **Database Errors?**
- Check Supabase URL is correct
- Verify all tables exist
- Check RLS policies are enabled

---

## 📊 After Deployment

### **Monitor:**
- [ ] Vercel Analytics (free)
- [ ] Error logs in Vercel
- [ ] Supabase usage

### **Share:**
- [ ] Post on social media
- [ ] Share with friends
- [ ] Get feedback

### **Iterate:**
- [ ] Collect user feedback
- [ ] Fix bugs
- [ ] Add requested features

---

## 🎉 Your App Will Be Live At:

**Vercel URL:** `https://eventally-YOUR-USERNAME.vercel.app`

**Custom Domain (optional):**
1. Go to Vercel → Settings → Domains
2. Add your custom domain
3. Update DNS records
4. Wait for SSL certificate

---

## 🚀 Quick Deploy Commands

```bash
# One-time setup
npm install -g vercel
vercel login

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ App loads on public URL
- ✅ Can create and view events
- ✅ Authentication works
- ✅ Email notifications arrive
- ✅ No console errors
- ✅ Mobile responsive

---

## 🎊 You're Ready to Deploy!

Follow Method 1 (Vercel Dashboard) - it's the easiest!

**Good luck! 🚀**
