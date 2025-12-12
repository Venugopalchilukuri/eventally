import { supabase } from './supabase';

export type EventStatus = 'draft' | 'published' | 'cancelled';

export interface StatusBadgeConfig {
    label: string;
    color: string;
    bgColor: string;
    icon: string;
}

/**
 * Get visual configuration for status badges
 */
export function getStatusConfig(status: EventStatus): StatusBadgeConfig {
    const configs: Record<EventStatus, StatusBadgeConfig> = {
        draft: {
            label: 'Draft',
            color: '#6B7280',
            bgColor: '#F3F4F6',
            icon: '📝'
        },
        published: {
            label: 'Published',
            color: '#059669',
            bgColor: '#D1FAE5',
            icon: '✅'
        },
        cancelled: {
            label: 'Cancelled',
            color: '#DC2626',
            bgColor: '#FEE2E2',
            icon: '❌'
        }
    };

    return configs[status];
}

/**
 * Update event status
 */
export async function updateEventStatus(
    eventId: string,
    newStatus: EventStatus
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('events')
            .update({ status: newStatus })
            .eq('id', eventId);

        if (error) {
            console.error('Error updating event status:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected error updating event status:', err);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Publish an event (change status from draft to published)
 */
export async function publishEvent(eventId: string) {
    return updateEventStatus(eventId, 'published');
}

/**
 * Cancel an event
 */
export async function cancelEvent(eventId: string) {
    return updateEventStatus(eventId, 'cancelled');
}

/**
 * Save event as draft
 */
export async function saveDraft(eventId: string) {
    return updateEventStatus(eventId, 'draft');
}

/**
 * Check if user can view an event based on status
 */
export function canViewEvent(
    event: { status: EventStatus; user_id?: string },
    currentUserId?: string
): boolean {
    // Published events are visible to everyone
    if (event.status === 'published') {
        return true;
    }

    // Draft and cancelled events are only visible to the owner
    if (currentUserId && event.user_id === currentUserId) {
        return true;
    }

    return false;
}

/**
 * Get events filtered by status
 */
export async function getEventsByStatus(
    status: EventStatus | EventStatus[],
    userId?: string
) {
    try {
        let query = supabase.from('events').select('*');

        if (Array.isArray(status)) {
            query = query.in('status', status);
        } else {
            query = query.eq('status', status);
        }

        // If userId is provided, also include their draft/cancelled events
        if (userId) {
            query = query.or(`status.eq.published,user_id.eq.${userId}`);
        }

        const { data, error } = await query.order('date', { ascending: true });

        if (error) {
            console.error('Error fetching events by status:', error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected error fetching events:', err);
        return { data: null, error: 'An unexpected error occurred' };
    }
}

/**
 * Get only published events (public view)
 */
export async function getPublishedEvents() {
    return getEventsByStatus('published');
}

/**
 * Get user's draft events
 */
export async function getUserDrafts(userId: string) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'draft')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user drafts:', error);
            return { data: null, error: error.message };
        }

        return { data, error: null };
    } catch (err) {
        console.error('Unexpected error fetching drafts:', err);
        return { data: null, error: 'An unexpected error occurred' };
    }
}

/**
 * Get event statistics by status for a user
 */
export async function getUserEventStats(userId: string) {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('status')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching event stats:', error);
            return null;
        }

        const stats = {
            draft: 0,
            published: 0,
            cancelled: 0,
            total: data.length
        };

        data.forEach((event) => {
            stats[event.status as EventStatus]++;
        });

        return stats;
    } catch (err) {
        console.error('Unexpected error fetching stats:', err);
        return null;
    }
}
