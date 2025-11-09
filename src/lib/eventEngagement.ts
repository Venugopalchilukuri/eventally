import { supabase } from './supabase';

export interface EventEngagement {
  likesCount: number;
  commentsCount: number;
  liked: boolean;
}

/**
 * Get engagement stats for an event (likes and comments count)
 */
export async function getEventEngagement(
  eventId: string,
  userId?: string
): Promise<EventEngagement> {
  try {
    // Get likes count
    const { count: likesCount } = await supabase
      .from('event_likes')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    // Get comments count (only top-level comments)
    const { count: commentsCount } = await supabase
      .from('event_comments')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .is('parent_comment_id', null);

    // Check if user liked (if userId provided)
    let liked = false;
    if (userId) {
      const { data } = await supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      liked = !!data;
    }

    return {
      likesCount: likesCount || 0,
      commentsCount: commentsCount || 0,
      liked,
    };
  } catch (error) {
    console.error('Error fetching event engagement:', error);
    return {
      likesCount: 0,
      commentsCount: 0,
      liked: false,
    };
  }
}

/**
 * Toggle like for an event
 */
export async function toggleEventLike(
  eventId: string,
  userId: string
): Promise<{ success: boolean; liked: boolean; likesCount: number; error?: string }> {
  try {
    const response = await fetch('/api/events/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, userId }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      liked: false,
      likesCount: 0,
      error: error.message,
    };
  }
}

/**
 * Batch get engagement for multiple events
 */
export async function getBatchEventEngagement(
  eventIds: string[],
  userId?: string
): Promise<Map<string, EventEngagement>> {
  const engagementMap = new Map<string, EventEngagement>();

  try {
    // Get all likes for these events
    const { data: likes } = await supabase
      .from('event_likes')
      .select('event_id, user_id')
      .in('event_id', eventIds);

    // Get all comments for these events
    const { data: comments } = await supabase
      .from('event_comments')
      .select('event_id')
      .in('event_id', eventIds)
      .is('parent_comment_id', null);

    // Process each event
    eventIds.forEach(eventId => {
      const eventLikes = likes?.filter((l: any) => l.event_id === eventId) || [];
      const eventComments = comments?.filter((c: any) => c.event_id === eventId) || [];
      const liked = userId ? eventLikes.some((l: any) => l.user_id === userId) : false;

      engagementMap.set(eventId, {
        likesCount: eventLikes.length,
        commentsCount: eventComments.length,
        liked,
      });
    });

    return engagementMap;
  } catch (error) {
    console.error('Error fetching batch engagement:', error);
    return engagementMap;
  }
}
