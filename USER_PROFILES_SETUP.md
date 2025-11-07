# User Profiles Feature

## ✅ What's Been Implemented

Your event platform now has **complete user profile system** with:
- 📝 Public user profiles
- 🖼️ Avatar support
- 📊 Event history & statistics
- 🔗 Social media links
- ✏️ Profile editing
- 🎨 Beautiful profile pages

---

## 🚀 Quick Setup

### Step 1: Run Database Setup

Run this SQL in **Supabase SQL Editor**:

```sql
-- Copy and paste the entire content from:
USER_PROFILES_DB_SETUP.sql
```

This creates:
- `user_profiles` table
- Row Level Security policies  
- Auto-profile creation trigger
- Indexes for performance

### Step 2: Test the Feature

1. **Edit your profile:**
   ```
   http://localhost:3000/settings/profile
   ```

2. **View your profile:**
   ```
   http://localhost:3000/profile/[your-username]
   ```

3. **Done!** Profiles work immediately!

---

## 🎯 Features

### Public Profile Page (`/profile/[username]`):

**Profile Header:**
- ✅ Avatar (custom image or auto-generated)
- ✅ Display name & username
- ✅ Location
- ✅ Bio (multi-line)
- ✅ Social links (Website, Twitter, LinkedIn, GitHub)

**Statistics:**
- ✅ Events Created count
- ✅ Total Attendees across events
- ✅ Events Attended count

**Event History:**
- ✅ Grid of all events user has created
- ✅ Event title, description, date
- ✅ Attendee count
- ✅ Click to view event details

### Profile Edit Page (`/settings/profile`):

**Editable Fields:**
- Username (unique, validated)
- Display Name
- Bio (500 characters)
- Avatar URL
- Location
- Website
- Twitter handle
- LinkedIn profile
- GitHub username

**Validation:**
- ✅ Username uniqueness check
- ✅ Format validation (alphanumeric, dashes, underscores)
- ✅ Minimum length (3 characters)
- ✅ Real-time feedback

---

## 📱 User Experience

### For Profile Owner:
```
1. Go to Settings → Edit Profile
2. Fill in bio, avatar, social links
3. Click "Save Profile"
4. View public profile
5. Share profile URL with others
```

### For Profile Visitors:
```
1. See user in event details (future)
2. Click on username
3. View their profile
4. See events they've created
5. Check out their social links
```

---

## 🎨 UI Components

### Avatar Display:

**With Custom Image:**
```tsx
<img src={avatar_url} alt={name} />
```

**Default Avatar:**
- Auto-generated color based on name
- Initial letter displayed
- 7 color variations (blue, purple, pink, green, yellow, red, indigo)

**Example:**
```
John Doe → "J" on blue background
Jane Smith → "J" on purple background
```

### Profile Header Design:

```
┌────────────────────────────────────┐
│   Gradient Cover (Purple-Blue)     │
│                                     │
│   ┌─────┐  John Doe (@johndoe)    │
│   │  J  │  📍 San Francisco        │
│   └─────┘                          │
│           Bio text here...         │
│           🌐 Website 🐦 Twitter    │
│                                     │
│   12        150         5          │
│   Events    Attendees   Attended   │
└────────────────────────────────────┘
```

---

## 🔧 Technical Details

### Database Schema:

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,           -- References auth.users
  username TEXT UNIQUE,          -- @username
  display_name TEXT,             -- Full name
  bio TEXT,                      -- About section
  avatar_url TEXT,               -- Profile picture
  location TEXT,                 -- City, Country
  website TEXT,                  -- Personal website
  twitter TEXT,                  -- @handle
  linkedin TEXT,                 -- Profile URL
  github TEXT,                   -- @username
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Auto-Profile Creation:

When users sign up:
1. Trigger fires on new auth.users row
2. Creates profile automatically
3. Sets default username = email
4. Sets default display_name = email prefix

**Example:**
```
Email: john.doe@example.com
→ Username: john.doe@example.com
→ Display Name: john.doe
```

### Username Validation:

**Rules:**
- ✅ Unique across all users
- ✅ 3+ characters
- ✅ Letters, numbers, dashes, underscores only
- ✅ Case-insensitive lookup
- ✅ Real-time availability check

**Valid:**
```
johndoe
john-doe
john_doe_123
JOHNDOE (case insensitive)
```

**Invalid:**
```
jo (too short)
john doe (spaces)
john@doe (special chars)
```

---

## 📊 Statistics Calculation

### Events Created:
```sql
SELECT COUNT(*) FROM events WHERE user_id = ?
```

### Events Attended:
```sql
SELECT COUNT(*) FROM registrations WHERE user_id = ?
```

### Total Attendees:
```sql
SELECT SUM(current_attendees) 
FROM events 
WHERE user_id = ?
```

---

## 🔗 Social Link Formatting

### Twitter:
```
Input: @johndoe  or  johndoe
Output: https://twitter.com/johndoe
```

### LinkedIn:
```
Input: johndoe  or  https://linkedin.com/in/johndoe
Output: https://linkedin.com/in/johndoe
```

### GitHub:
```
Input: @johndoe  or  johndoe
Output: https://github.com/johndoe
```

### Website:
```
Input: example.com  or  https://example.com
Output: https://example.com
```

---

## 🎯 Integration Points

### Future Enhancements:

**1. Show Creator on Event Cards:**
```tsx
<Link href={`/profile/${event.creator_username}`}>
  <img src={creator_avatar} />
  <span>{creator_name}</span>
</Link>
```

**2. Creator Badge:**
```tsx
{isCreator && (
  <span className="badge">Event Creator</span>
)}
```

**3. Follow System:**
```tsx
<button onClick={followUser}>
  {isFollowing ? "Unfollow" : "Follow"}
</button>
```

**4. Profile Completion:**
```tsx
Profile Strength: 80%
Missing: Avatar, Bio
```

---

## 🔐 Security & Privacy

### Row Level Security:

**Read Access:**
- ✅ Anyone can view profiles (public)
- ✅ No authentication required

**Write Access:**
- ✅ Users can only edit their own profile
- ✅ Username uniqueness enforced
- ✅ No profile deletion (linked to auth)

### Data Validation:

**Server-side:**
- RLS policies enforce user ownership
- Database constraints prevent duplicates

**Client-side:**
- Real-time username validation
- Format checking before submission
- User-friendly error messages

---

## 📱 Responsive Design

### Mobile (< 768px):
- Stacked layout
- Avatar: 32x32 (profile cards), 128x128 (profile page)
- Full-width sections
- Touch-friendly buttons

### Tablet (768px - 1024px):
- 2-column stats grid
- Larger avatar (96x96)
- Side-by-side layout where space allows

### Desktop (> 1024px):
- 3-column stats grid
- Full profile header
- Multi-column event grid

---

## 🎨 Customization

### Change Avatar Size:

```tsx
// Profile page
className="w-32 h-32 rounded-full"

// Event cards (future)
className="w-10 h-10 rounded-full"
```

### Custom Avatar Colors:

Edit `/src/lib/profiles.ts`:

```typescript
const colors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  // Add your colors...
];
```

### Add More Social Links:

1. **Add to database:**
```sql
ALTER TABLE user_profiles 
ADD COLUMN instagram TEXT;
```

2. **Add to form:**
```tsx
<input name="instagram" ... />
```

3. **Add to display:**
```tsx
{profile.instagram && (
  <a href={`https://instagram.com/${profile.instagram}`}>
    Instagram
  </a>
)}
```

---

## 🐛 Troubleshooting

### Profile Not Found:

**Check:**
1. User signed up after database setup?
2. Profile auto-created by trigger?
3. Username spelled correctly?

**Fix:**
```sql
-- Manually create profile
INSERT INTO user_profiles (id, username, display_name)
VALUES ('user-id', 'username', 'Display Name');
```

### Username Already Taken:

**Error:** "Username is already taken"

**Fix:**
- Choose different username
- Check if you're the owner (case mismatch)
- Contact admin if truly unique

### Avatar Not Showing:

**Check:**
1. URL is valid (starts with http/https)
2. Image is publicly accessible
3. No CORS issues
4. Image format supported (jpg, png, gif, webp)

**Fix:**
- Use image hosting (Imgur, Gravatar)
- Check URL in browser first
- Use https:// not http://

---

## 🚀 Usage Examples

### Basic Profile:
```
Username: johndoe
Display Name: John Doe
Bio: Event organizer and tech enthusiast
Location: San Francisco, CA
```

### Complete Profile:
```
Username: janedoe
Display Name: Jane Smith
Bio: Community builder | Tech events | Coffee lover
Location: New York, NY
Website: https://janesmith.com
Twitter: @janedoe
LinkedIn: janedoe
GitHub: janedoe
Avatar: https://i.imgur.com/abc123.jpg
```

---

## 📈 Benefits

### For Users:
- 🎯 Personal branding
- 📊 Track event history
- 🔗 Share social profiles
- ⭐ Build credibility

### For Platform:
- 👥 Social engagement
- 🔍 Discoverable creators
- 📈 User retention
- 💪 Professional appearance

---

## 🎉 You're All Set!

Your user profile system is ready with:
- ✅ Public profile pages
- ✅ Profile editing interface
- ✅ Social media integration
- ✅ Event history tracking
- ✅ Statistics display
- ✅ Avatar support

---

## 🧪 Test Checklist:

- [ ] Run database setup SQL
- [ ] Sign up / Log in
- [ ] Visit /settings/profile
- [ ] Fill in profile details
- [ ] Add avatar URL
- [ ] Add social links
- [ ] Save profile
- [ ] View public profile at /profile/[username]
- [ ] Check event history
- [ ] Verify stats display
- [ ] Test social link clicks
- [ ] Try editing profile again
- [ ] Test username validation

---

## 🔗 Profile URLs:

**Edit Profile:**
```
/settings/profile
```

**View Profile:**
```
/profile/johndoe
/profile/jane-smith
/profile/tech_organizer
```

---

**Your users now have professional profiles to showcase their events and connect with others! 🎊👤**
