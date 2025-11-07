# ✅ Testing External Event Registration

## 🎯 Verification Checklist

This guide ensures that imported events correctly redirect users to the original platform for registration.

---

## 📋 Pre-Test Setup

### **1. Start Development Server**
```bash
npm run dev
# Server should start at http://localhost:3000
```

### **2. Ensure You're Logged In**
```bash
# Visit: http://localhost:3000/login
# Login with your credentials
```

---

## 🧪 Test Case 1: Import External Event

### **Step-by-Step Test:**

1. **Import a Facebook Event**
   ```
   ✓ Click "📎 Import" in navigation
   ✓ Paste URL: https://facebook.com/events/123456789
   ✓ Click "Next"
   ✓ Fill event details
   ✓ Click "Import Event"
   ```

2. **Verify Import Success**
   ```
   ✓ Redirected to event details page
   ✓ Event description contains: "📎 Original Event: https://facebook.com/..."
   ```

---

## 🧪 Test Case 2: Verify Event Card Display

### **On Homepage or Events Page:**

1. **Find Your Imported Event**
   ```
   ✓ Event card shows "🔗 External" badge (Blue)
   ✓ Button text is "View & Register →" (Not "Register for Event")
   ✓ Button has gradient styling (blue to purple)
   ```

2. **Compare with Internal Event**
   ```
   ✓ Internal events show NO "🔗 External" badge
   ✓ Button text is "Register for Event"
   ✓ Button is solid purple
   ```

**Screenshot Example:**
```
External Event Card:
┌───────────────────────────┐
│ [Image]                   │
│ [Tech] [🔗 External]     │ ← Badge present
│ Google I/O 2025          │
│ [View & Register →]      │ ← Different text
└───────────────────────────┘

Internal Event Card:
┌───────────────────────────┐
│ [Image]                   │
│ [Tech]                    │ ← No external badge
│ Local Meetup             │
│ [Register for Event]     │ ← Standard text
└───────────────────────────┘
```

---

## 🧪 Test Case 3: Event Details Page

### **Visit Imported Event Details:**

1. **Click on External Event Card**
   ```
   ✓ Opens event details page
   ```

2. **Verify External Event Notice**
   ```
   ✓ See blue notice box at top of registration section
   ✓ Notice says "🔗 External Event"
   ✓ Explanation text: "This event is hosted on an external platform..."
   ```

3. **Verify Registration Button**
   ```
   ✓ Large button says "🔗 Register on Original Platform"
   ✓ Button has gradient styling (blue to purple)
   ✓ Button shows external link icon (↗)
   ```

4. **Verify Optional Tracking Button**
   ```
   ✓ See "📌 Track This Event" button
   ✓ Button is secondary style (purple)
   ```

**Screenshot Example:**
```
┌────────────────────────────────────────────────┐
│  🔗 External Event                             │
│  This event is hosted on an external platform. │
│  You can track it here and register on the     │
│  original site.                                │
│                                                │
│  Interested in This Event?                     │
│  Track this event here and register on the     │
│  original platform to attend.                  │
│                                                │
│  [🔗 Register on Original Platform ↗]         │
│  [📌 Track This Event]  [Add to Calendar]     │
└────────────────────────────────────────────────┘
```

---

## 🧪 Test Case 4: Click Registration Button

### **Most Important Test:**

1. **Right-Click on "Register on Original Platform" Button**
   ```
   ✓ Context menu shows "Open link in new tab"
   ✓ Confirms it's a link, not just a button
   ```

2. **Click "Register on Original Platform" Button**
   ```
   ✓ New tab opens automatically
   ✓ URL in new tab is the original event URL
   ✓ Original platform loads (Facebook/Google/Eventbrite)
   ```

3. **Verify Eventally Tab Remains Open**
   ```
   ✓ Original tab stays on Eventally
   ✓ No redirect in current tab
   ```

**Expected Behavior:**
```
User on Eventally → Clicks button → New tab opens with Facebook
                                   → Original tab stays on Eventally
```

---

## 🧪 Test Case 5: Tracking Feature

### **Test Optional Tracking:**

1. **On External Event Details Page**
   ```
   ✓ Find "📌 Track This Event" button
   ✓ Button is visible and enabled
   ```

2. **Click "Track This Event"**
   ```
   ✓ Button text changes to "Adding..."
   ✓ Success message appears
   ✓ Button changes to "Stop Tracking"
   ✓ Badge changes to "✓ Tracking" (Green)
   ```

3. **Verify in My Registrations**
   ```
   ✓ Go to "My Registrations"
   ✓ Tracked event appears in list
   ✓ Shows "✓ Tracking" badge
   ```

4. **Verify Reminder Will Be Sent**
   ```
   ✓ Event is in registrations table
   ✓ Will receive 24h reminder
   ✓ Reminder will mention external event
   ```

---

## 🧪 Test Case 6: Different External Platforms

### **Test Multiple Platforms:**

#### Facebook Event:
```
Import: https://facebook.com/events/123456789
✓ Redirects to facebook.com
✓ Opens event page
✓ User can register on Facebook
```

#### Google Calendar Event:
```
Import: https://calendar.google.com/event?eid=abc123
✓ Redirects to calendar.google.com
✓ Opens event view
✓ User can add to their calendar
```

#### Eventbrite Event:
```
Import: https://eventbrite.com/e/event-name-123
✓ Redirects to eventbrite.com
✓ Opens event page
✓ User can purchase tickets
```

#### Meetup Event:
```
Import: https://meetup.com/group/events/123
✓ Redirects to meetup.com
✓ Opens event page
✓ User can RSVP
```

---

## 🧪 Test Case 7: Internal Events (Comparison)

### **Verify Internal Events Work Normally:**

1. **Create Internal Event**
   ```
   ✓ Click "Create Event" (not Import)
   ✓ Fill details
   ✓ Submit
   ```

2. **View Internal Event Details**
   ```
   ✓ NO "🔗 External Event" notice
   ✓ Registration section says "Ready to Join?"
   ✓ Button says "✓ Register for This Event" (not redirect)
   ```

3. **Register for Internal Event**
   ```
   ✓ Click "Register for This Event"
   ✓ NO new tab opens
   ✓ Registration happens in Eventally
   ✓ Success message appears
   ✓ Email confirmation sent
   ```

---

## 🔍 Technical Verification

### **Check Browser Developer Tools:**

1. **Inspect Button Element**
   ```html
   <!-- External Event Button Should Be: -->
   <a 
     href="https://facebook.com/events/123456" 
     target="_blank" 
     rel="noopener noreferrer"
     class="...gradient..."
   >
     🔗 Register on Original Platform
     <svg>...</svg>
   </a>
   ```

2. **Verify Link Attributes**
   ```
   ✓ href="[original-url]" - Correct URL
   ✓ target="_blank" - Opens new tab
   ✓ rel="noopener noreferrer" - Security attributes
   ```

3. **Check Description Format**
   ```
   ✓ Event description contains newline
   ✓ Contains: "📎 Original Event: https://..."
   ✓ URL is on separate line
   ```

---

## 🐛 Troubleshooting

### **Issue: Button Doesn't Open New Tab**

**Check:**
```javascript
// In browser console
const link = document.querySelector('a[href*="facebook"]');
console.log(link.target); // Should be "_blank"
console.log(link.href);   // Should be full URL
```

**Solution:**
- Ensure `target="_blank"` is present
- Check no JavaScript blocking the click
- Verify popup blocker not active

---

### **Issue: Wrong URL Opens**

**Check:**
```javascript
// In src/app/events/[id]/page.tsx
const urlMatch = event.description?.match(/📎 Original Event: (https?:\/\/[^\s]+)/);
console.log('Extracted URL:', urlMatch[1]);
```

**Solution:**
- Verify description contains correct URL
- Check regex pattern matches
- Re-import event if necessary

---

### **Issue: External Badge Not Showing**

**Check:**
```javascript
// In src/components/EventCard.tsx
const isExternalEvent = event.description?.includes('📎 Original Event:');
console.log('Is External:', isExternalEvent);
```

**Solution:**
- Verify description contains marker
- Check exact text match
- Rebuild and refresh

---

## ✅ Success Criteria

### **All Tests Pass When:**

- ✅ External events show "🔗 External" badge
- ✅ Button text is "View & Register →" on cards
- ✅ Event details show external notice
- ✅ "Register on Original Platform" button present
- ✅ Clicking opens new tab with correct URL
- ✅ Original tab stays on Eventally
- ✅ Tracking feature works
- ✅ Internal events work normally
- ✅ No console errors

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Test Case 1: Import External Event       [ ] Pass [ ] Fail
Test Case 2: Event Card Display          [ ] Pass [ ] Fail
Test Case 3: Event Details Page          [ ] Pass [ ] Fail
Test Case 4: Registration Button         [ ] Pass [ ] Fail
Test Case 5: Tracking Feature            [ ] Pass [ ] Fail
Test Case 6: Multiple Platforms          [ ] Pass [ ] Fail
Test Case 7: Internal Events             [ ] Pass [ ] Fail

Issues Found:
_________________________________________________
_________________________________________________

Notes:
_________________________________________________
_________________________________________________
```

---

## 🚀 Quick Test Script

### **Automated Quick Test:**

```javascript
// Run in browser console on event details page
const testExternalEvent = () => {
  const description = document.querySelector('p')?.textContent;
  const externalBadge = document.querySelector('[class*="blue"]');
  const registerButton = document.querySelector('a[target="_blank"]');
  
  console.log('Has external URL:', description?.includes('📎'));
  console.log('Has external badge:', !!externalBadge);
  console.log('Has redirect button:', !!registerButton);
  console.log('Button URL:', registerButton?.href);
  console.log('Opens new tab:', registerButton?.target === '_blank');
  
  return {
    hasUrl: description?.includes('📎'),
    hasBadge: !!externalBadge,
    hasButton: !!registerButton,
    opensNewTab: registerButton?.target === '_blank'
  };
};

console.table(testExternalEvent());
```

---

## 📝 User Flow Diagram

```
User Journey for External Event:

1. Discovery
   └─→ Browse Eventally
       └─→ See event with "🔗 External" badge
           └─→ Interest piqued

2. Investigation
   └─→ Click "View & Register →"
       └─→ Land on event details
           └─→ Read full description
               └─→ See "External Event" notice

3. Decision
   └─→ Click "Register on Original Platform"
       └─→ New tab opens with Facebook/Google/etc.
           └─→ See original event
               └─→ Register on that platform

4. Optional Tracking
   └─→ Return to Eventally tab
       └─→ Click "Track This Event"
           └─→ Get reminders 24h before
```

---

## 🎯 Expected vs Actual

### **Expected Behavior Table:**

| Action | Expected Result | Verification Method |
|--------|----------------|---------------------|
| Import external event | Description contains URL | Check description field |
| View event card | Shows "🔗 External" badge | Visual inspection |
| Click card button | Opens event details | Navigation works |
| View details | Shows external notice | Blue box visible |
| Click register button | Opens new tab | New tab appears |
| New tab URL | Matches original URL | Check address bar |
| Original tab | Stays on Eventally | Tab still active |
| Track event | Added to registrations | Check My Registrations |

---

## 🎉 Final Verification

**Platform is working correctly when:**

1. ✅ Users can import events from any platform
2. ✅ External events are clearly marked
3. ✅ Clicking redirect button opens original platform
4. ✅ Users can register on original platform
5. ✅ Optional tracking works
6. ✅ Reminders sent for tracked events
7. ✅ No broken links or errors
8. ✅ User experience is smooth and intuitive

**If all tests pass, your Eventally platform correctly redirects users to original platforms for registration! 🚀**
