import { supabase } from './supabase';
import type { Event } from './supabase';

interface RecommendationScore {
  event: Event;
  score: number;
  matchPercentage: number;
  reason: string;
}

/**
 * Get personalized event recommendations for a user
 * Uses smart logic to appear AI-powered but works immediately
 */
export async function getRecommendationsForUser(
  userId: string,
  limit: number = 6,
  excludeEventIds: string[] = []
): Promise<RecommendationScore[]> {
  try {
    // Get user's registration history
    const { data: registrations } = await supabase
      .from('registrations')
      .select('event_id')
      .eq('user_id', userId);

    const registeredEventIds = registrations?.map(r => r.event_id) || [];

    // Get user's favorite categories (from registered events)
    const { data: registeredEvents } = await supabase
      .from('events')
      .select('category')
      .in('id', registeredEventIds.length > 0 ? registeredEventIds : ['']);

    const categoryCount: Record<string, number> = {};
    registeredEvents?.forEach(event => {
      categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
    });

    // Get favorite category
    const favoriteCategory = Object.keys(categoryCount).length > 0
      ? Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    // Get all upcoming events (excluding registered ones and already displayed ones)
    const today = new Date().toISOString().split('T')[0];
    const allExcludedIds = [...registeredEventIds, ...excludeEventIds];
    
    let query = supabase
      .from('events')
      .select('*')
      .gte('date', today);
    
    // Only add the exclusion filter if there are IDs to exclude
    if (allExcludedIds.length > 0) {
      query = query.not('id', 'in', `(${allExcludedIds.join(',')})`);
    }
    
    const { data: allEvents } = await query.order('date', { ascending: true });

    if (!allEvents || allEvents.length === 0) {
      return [];
    }

    // Score each event
    const scoredEvents: RecommendationScore[] = allEvents.map(event => {
      let score = 0;
      let reason = 'Popular event';

      // Category match (highest weight)
      if (favoriteCategory && event.category === favoriteCategory) {
        score += 50;
        reason = `You like ${favoriteCategory} events`;
      }

      // Popularity score (based on current attendees)
      const popularityScore = Math.min(event.current_attendees * 2, 30);
      score += popularityScore;
      if (popularityScore > 20) {
        reason = 'Trending event';
      }

      // Near capacity = hot event
      if (event.max_attendees && event.current_attendees / event.max_attendees > 0.7) {
        score += 10;
        reason = 'Almost full - popular event';
      }

      // Recently created = fresh content
      const createdDate = new Date(event.created_at);
      const daysSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) {
        score += 5;
      }

      // Convert score to percentage (0-100)
      const matchPercentage = Math.min(Math.round((score / 90) * 100), 99);

      return {
        event,
        score,
        matchPercentage,
        reason
      };
    });

    // Sort by score and return top N
    return scoredEvents
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
}

/**
 * Get similar events (for "You Might Also Like" on event pages)
 */
export async function getSimilarEvents(
  eventId: string,
  eventCategory: string,
  limit: number = 3
): Promise<Event[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // First, try to get events in same category
    const { data: sameCategoryEvents } = await supabase
      .from('events')
      .select('*')
      .eq('category', eventCategory)
      .neq('id', eventId)
      .gte('date', today)
      .order('current_attendees', { ascending: false })
      .limit(limit);

    // If we have enough events in same category, return them
    if (sameCategoryEvents && sameCategoryEvents.length >= limit) {
      return sameCategoryEvents;
    }

    // If not enough in same category, get popular events from any category
    const { data: popularEvents } = await supabase
      .from('events')
      .select('*')
      .neq('id', eventId)
      .gte('date', today)
      .order('current_attendees', { ascending: false })
      .limit(limit);

    return popularEvents || sameCategoryEvents || [];
  } catch (error) {
    console.error('Error getting similar events:', error);
    return [];
  }
}

/**
 * Get popular/trending events (for new users with no history)
 */
export async function getTrendingEvents(limit: number = 6, excludeEventIds: string[] = []): Promise<Event[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    let query = supabase
      .from('events')
      .select('*')
      .gte('date', today);
    
    // Exclude already displayed events - only add filter if there are IDs to exclude
    if (excludeEventIds.length > 0) {
      query = query.not('id', 'in', `(${excludeEventIds.join(',')})`);
    }
    
    const { data: trending, error } = await query
      .order('current_attendees', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error in getTrendingEvents query:', error);
      return [];
    }

    return trending || [];
  } catch (error) {
    console.error('Error getting trending events:', error);
    return [];
  }
}
