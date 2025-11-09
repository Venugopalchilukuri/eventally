# ❤️ Event Likes & Comments Count - Setup Guide

## ✨ What You Just Got

Every event card now displays:
- ❤️ **Heart/Like button** - Users can like events
- 💬 **Comment count** - Shows number of discussions
- 🎨 **Beautiful animations** - Hover effects and transitions
- 🔐 **Secure** - Authenticated users only

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Run the Database Setup

Open your **Supabase SQL Editor** and run:

```sql
-- Copy and paste the contents of EVENT_LIKES_SETUP.sql
```

Or directly in Supabase:
1. Go to **Supabase Dashboard** → **SQL Editor**
2. Copy contents from `EVENT_LIKES_SETUP.sql`
3. Click **Run**

This creates:
- ✅ `event_likes` table
- ✅ Indexes for performance
- ✅ Row Level Security policies
- ✅ Helper functions

### Step 2: Verify Tables Created

In Supabase, check **Table Editor**:
- `event_likes` table should exist
- `event_comments` table should exist (from previous setup)

### Step 3: Test the Feature!

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🎨 What Users See

### On Every Event Card:

```
[Event Image]
━━━━━━━━━━━━━━━━━━━━━━━━
📅 Date | ⏰ Time | 📍 Location | 👥 Attendees
━━━━━━━━━━━━━━━━━━━━━━━━
❤️ 23    💬 8
━━━━━━━━━━━━━━━━━━━━━━━━
[View Details] [Share] [Calendar]
[Register for Event]
```

---

## ✨ Features

### **1. Heart/Like Button**
- ❤️ Click to like (fills red)
- 💔 Click again to unlike
- Shows total like count
- Hover animation (scales up)
- Requires login

### **2. Comment Count**
- 💬 Shows number of top-level comments
- Clickable - jumps to comments section
- Hover animation
- Updates in real-time

### **3. Smart Behavior**
- Like count updates instantly
- Comment count loads on page
- Works for logged-in and guest users
- Guest users can see counts but can't like

---

## 🧪 Testing

### Test Likes:
1. **As Guest:**
   - Visit any event
   - See heart icon and count
   - Click heart → "Please log in to like events"

2. **As Logged-In User:**
   - Click heart → Fills red, count increases
   - Click again → Empties, count decreases
   - Refresh page → Like state persists

3. **Multiple Users:**
   - User A likes event → Count = 1
   - User B likes event → Count = 2
   - User A unlikes → Count = 1

### Test Comments Count:
1. Go to event details page
2. Add a comment
3. Return to events list
4. Comment count should show 1
5. Click comment icon → Jumps to comments

---

## 🎯 Database Schema

### event_likes table:
```
id              UUID (Primary Key)
event_id        UUID (Foreign Key → events)
user_id         UUID (Foreign Key → auth.users)
created_at      Timestamp
UNIQUE(event_id, user_id)  ← One like per user
```

### Indexes:
- `event_id` - Fast lookup by event
- `user_id` - Fast lookup by user
- `created_at` - Sort by recent

---

## 📊 API Endpoints

### POST /api/events/like
Toggle like/unlike for an event

**Request:**
```json
{
  "eventId": "uuid",
  "userId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "liked": true,
  "likesCount": 23
}
```

### GET /api/events/like?eventId=xxx&userId=yyy
Get like status and count

**Response:**
```json
{
  "success": true,
  "liked": false,
  "likesCount": 23
}
```

---

## 🔧 Customization

### Change Heart Color:
```tsx
// In src/components/EventCard.tsx
engagement.liked
  ? 'text-red-500 hover:text-red-600'  // Change red to any color
  : 'text-gray-500 hover:text-red-500'
```

### Change Icons:
Replace the SVG paths in `EventCard.tsx`:
- Heart icon (line ~255)
- Comment icon (line ~277)

### Add More Reactions:
Create additional tables:
```sql
CREATE TABLE event_reactions (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES auth.users(id),
  reaction_type TEXT, -- 'like', 'love', 'wow', 'sad'
  created_at TIMESTAMP
);
```

---

## 📈 Analytics Ideas

Track engagement metrics:

```sql
-- Most liked events
SELECT e.title, COUNT(el.id) as likes
FROM events e
LEFT JOIN event_likes el ON e.id = el.event_id
GROUP BY e.id
ORDER BY likes DESC
LIMIT 10;

-- Most discussed events
SELECT e.title, COUNT(ec.id) as comments
FROM events e
LEFT JOIN event_comments ec ON e.id = ec.event_id
GROUP BY e.id
ORDER BY comments DESC
LIMIT 10;

-- User engagement
SELECT u.email, 
  COUNT(DISTINCT el.event_id) as events_liked,
  COUNT(DISTINCT ec.event_id) as events_commented
FROM auth.users u
LEFT JOIN event_likes el ON u.id = el.user_id
LEFT JOIN event_comments ec ON u.id = ec.user_id
GROUP BY u.id;
```

---

## 🚀 Performance Tips

### 1. Use Batch Loading (Already Implemented)
```typescript
// src/lib/eventEngagement.ts
getBatchEventEngagement(eventIds, userId)
```

This loads engagement for multiple events in 2 queries instead of N queries.

### 2. Add Caching
```typescript
// In EventCard.tsx
const CACHE_TIME = 60000; // 1 minute
let cachedEngagement = {};
```

### 3. Real-time Updates (Advanced)
```typescript
// Subscribe to changes
supabase
  .channel('event_likes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'event_likes' },
    payload => {
      // Update engagement counts
    }
  )
  .subscribe();
```

---

## 💡 Future Enhancements

### Easy Additions:
- [ ] Who liked? Show list of users
- [ ] Like notifications (organizer gets notified)
- [ ] Most liked events page
- [ ] Trending events (by likes in last 24h)

### Medium:
- [ ] Multiple reactions (❤️ 😂 😮 😢 😡)
- [ ] Like button on event details page
- [ ] Activity feed (User X liked Event Y)

### Advanced:
- [ ] Real-time like counter
- [ ] Like animations (hearts floating up)
- [ ] Social proof ("23 people you follow liked this")

---

## 🎊 What This Enables

### **User Engagement:**
- Social proof (popular events get more attention)
- Bookmarking (like = save for later)
- Discovery (find events friends like)

### **Event Organizers:**
- Gauge interest before event
- Identify popular content
- Track event performance

### **Platform Growth:**
- More time on site (liking is addictive!)
- Return visits (check if event got likes)
- Viral potential (share liked events)

---

## ✅ Checklist

Before going live:
- [ ] Database tables created
- [ ] Indexes added
- [ ] RLS policies enabled
- [ ] API endpoints tested
- [ ] Like button works
- [ ] Unlike works
- [ ] Comment count shows
- [ ] Guest users see counts
- [ ] Mobile responsive

---

## 🐛 Troubleshooting

### Likes not saving?
- Check RLS policies in Supabase
- Verify user is authenticated
- Check browser console for errors

### Comment count wrong?
- Refresh the page
- Check `event_comments` table exists
- Verify comments have correct `event_id`

### Button not working?
- Check user is logged in
- Look for JavaScript errors
- Verify API endpoint is accessible

---

## 🎉 You're Done!

Your event cards now have:
- ✅ Interactive like button
- ✅ Comment count display
- ✅ Beautiful animations
- ✅ Social engagement

**Users will love the social features!** ❤️💬

---

## 📚 Files Created/Modified

**New Files:**
- `src/lib/eventEngagement.ts` - Helper functions
- `src/app/api/events/like/route.ts` - API endpoint
- `EVENT_LIKES_SETUP.sql` - Database schema
- `EVENT_ENGAGEMENT_SETUP.md` - This guide

**Modified Files:**
- `src/components/EventCard.tsx` - Added engagement UI

---

**Next Steps:** Deploy and watch your engagement metrics soar! 🚀
