# Event Status Feature Implementation Guide

## Overview
The Event Status feature has been successfully implemented in Eventally. This feature allows event organizers to manage their events with three distinct states: **Draft**, **Published**, and **Cancelled**.

## Feature Components

### 1. Database Schema (`EVENT_STATUS_SETUP.sql`)

**What was added:**
- `status` column to the `events` table (TEXT with CHECK constraint)
- `published_at` timestamp column to track when events go live
- Database indexes for performance
- Automatic trigger to set `published_at` when status changes to 'published'
- Row Level Security (RLS) policies to control visibility

**Status Values:**
- `draft` - Event is being created, not visible to public
- `published` - Event is live and visible to everyone
- `cancelled` - Event has been cancelled

**To apply the database changes:**
1. Open your Supabase SQL Editor
2. Copy and paste the contents of `EVENT_STATUS_SETUP.sql`
3. Run the script

### 2. TypeScript Types (`src/lib/supabase.ts`)

**Updated interfaces:**
```typescript
export interface Event {
  // ... existing fields
  status: 'draft' | 'published' | 'cancelled';
  published_at?: string;
}

export interface EventInsert {
  // ... existing fields
  status?: 'draft' | 'published' | 'cancelled';
}
```

### 3. Utility Functions (`src/lib/eventStatus.ts`)

**Available functions:**
- `getStatusConfig(status)` - Get visual configuration for status badges
- `updateEventStatus(eventId, newStatus)` - Update event status
- `publishEvent(eventId)` - Publish a draft event
- `cancelEvent(eventId)` - Cancel an event
- `saveDraft(eventId)` - Save event as draft
- `canViewEvent(event, currentUserId)` - Check viewing permissions
- `getEventsByStatus(status, userId)` - Filter events by status
- `getPublishedEvents()` - Get only published events
- `getUserDrafts(userId)` - Get user's draft events
- `getUserEventStats(userId)` - Get event statistics by status

### 4. UI Components

#### EventStatusBadge (`src/components/EventStatusBadge.tsx`)
Displays a color-coded badge showing the event status.

**Usage:**
```tsx
<EventStatusBadge status="published" size="md" showIcon={true} />
```

**Props:**
- `status` - The event status ('draft' | 'published' | 'cancelled')
- `size` - Badge size ('sm' | 'md' | 'lg'), default: 'md'
- `showIcon` - Whether to show emoji icon, default: true

#### EventStatusControl (`src/components/EventStatusControl.tsx`)
Interactive dropdown for event owners to change event status.

**Usage:**
```tsx
<EventStatusControl
  eventId={event.id}
  currentStatus={event.status}
  onStatusChange={(newStatus) => {
    // Handle status change
  }}
/>
```

**Features:**
- Confirmation dialogs for publishing and cancelling
- Real-time status updates
- Status descriptions
- Error handling

### 5. Integration Points

#### Event Card (`src/components/EventCard.tsx`)
- Shows status badge to event owners only
- Badge appears in the top badges section

#### Create Event Page (`src/app/create/page.tsx`)
- Status selector with draft/published options
- Defaults to 'draft'
- Helpful descriptions for each status
- Status is saved when creating the event

#### Edit Event Page (`src/app/edit-event/[id]/page.tsx`)
- EventStatusControl component for changing status
- Status updates in real-time
- Changes are saved with the event

#### Home Page (`src/app/page.tsx`)
- Statistics now only count published events
- Ensures accurate public-facing metrics

## User Workflows

### Creating a New Event

1. **Save as Draft (Default)**
   - Event is created with `status: 'draft'`
   - Only visible to the creator
   - Can be edited freely
   - Not searchable or discoverable

2. **Publish Immediately**
   - Select "Published" status before creating
   - Event goes live immediately
   - Visible to all users
   - Searchable and discoverable

### Managing Existing Events

1. **Publishing a Draft**
   - Go to Edit Event page
   - Change status from "Draft" to "Published"
   - Confirm the action
   - `published_at` timestamp is automatically set
   - Event becomes visible to everyone

2. **Cancelling an Event**
   - Go to Edit Event page
   - Change status to "Cancelled"
   - Confirm the action (warns about notifying attendees)
   - Event may still be visible but marked as cancelled
   - Registration is disabled

3. **Reverting to Draft**
   - Change status back to "Draft"
   - Event becomes private again
   - Useful for making major changes

## Visibility Rules

### Public Users (Not Logged In)
- Can only see events with `status = 'published'`
- Cannot see draft or cancelled events

### Logged In Users
- Can see all published events
- Can see their own draft and cancelled events
- Cannot see other users' draft events

### Event Owners
- Can see all their events regardless of status
- Can change status of their own events
- Status badge is visible on their event cards

## Database Policies (RLS)

The following Row Level Security policies are in place:

1. **SELECT Policy**: Users can view published events OR their own events
2. **UPDATE Policy**: Users can only update their own events
3. **INSERT Policy**: Users can only insert events with their own user_id
4. **DELETE Policy**: Users can only delete their own events

## Best Practices

### For Event Organizers

1. **Use Drafts for Planning**
   - Create events as drafts while finalizing details
   - Publish only when everything is confirmed

2. **Publish Strategically**
   - Publish events when you're ready for registrations
   - Consider timing for maximum visibility

3. **Cancellation Communication**
   - When cancelling, manually notify attendees
   - Consider keeping the event visible with cancelled status for transparency

### For Developers

1. **Always Filter by Status**
   - Public event lists should filter for `status = 'published'`
   - User dashboards should show all statuses with filters

2. **Check Permissions**
   - Use `canViewEvent()` utility before displaying event details
   - Respect RLS policies

3. **Handle Status Changes**
   - Show confirmation dialogs for destructive actions
   - Provide clear feedback on status changes
   - Consider sending notifications to attendees

## Testing Checklist

- [ ] Run `EVENT_STATUS_SETUP.sql` in Supabase
- [ ] Create a new event as draft - verify it's not visible publicly
- [ ] Publish a draft event - verify it becomes visible
- [ ] Cancel an event - verify status updates
- [ ] Check that only published events appear in public listings
- [ ] Verify status badge shows for event owners
- [ ] Test status control in edit page
- [ ] Confirm RLS policies are working correctly

## Future Enhancements

Potential improvements for this feature:

1. **Email Notifications**
   - Notify attendees when event is cancelled
   - Send reminders before event is published

2. **Scheduled Publishing**
   - Allow setting a future publish date/time
   - Automatic status change at scheduled time

3. **Status History**
   - Track all status changes
   - Show audit log to event owners

4. **Bulk Operations**
   - Publish/cancel multiple events at once
   - Useful for event organizers with many events

5. **Advanced Filters**
   - Filter events by status in event listings
   - Show draft count in dashboard

## Troubleshooting

### Events not showing up
- Check if event status is 'published'
- Verify RLS policies are enabled
- Check user authentication

### Status not updating
- Verify database connection
- Check for JavaScript errors in console
- Ensure user owns the event

### Badge not showing
- Confirm user is logged in
- Verify user is the event owner
- Check that event has status field

## Support

For issues or questions about this feature:
1. Check the implementation files listed above
2. Review the database schema in Supabase
3. Test with the SQL script provided
4. Verify all components are properly imported

---

**Implementation Date**: December 12, 2025
**Status**: ✅ Complete and Ready for Testing
