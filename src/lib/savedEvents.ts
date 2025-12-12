/**
 * Saved Events Library
 * Handles all operations related to bookmarking/saving events
 */

import { supabase } from './supabase';

export interface SavedEvent {
    id: string;
    user_id: string;
    event_id: string;
    saved_at: string;
}

/**
 * Save an event for a user
 */
export async function saveEvent(eventId: string, userId: string) {
    try {
        const { data, error } = await supabase
            .from('saved_events')
            .insert({
                user_id: userId,
                event_id: eventId,
            })
            .select()
            .single();

        if (error) {
            // Check if it's a duplicate error (already saved)
            if (error.code === '23505') {
                return { success: true, data: null, alreadySaved: true };
            }
            throw error;
        }

        return { success: true, data, alreadySaved: false };
    } catch (error) {
        console.error('Error saving event:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to save event',
            alreadySaved: false
        };
    }
}

/**
 * Unsave/remove a saved event
 */
export async function unsaveEvent(eventId: string, userId: string) {
    try {
        const { error } = await supabase
            .from('saved_events')
            .delete()
            .eq('user_id', userId)
            .eq('event_id', eventId);

        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('Error unsaving event:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to unsave event'
        };
    }
}

/**
 * Check if an event is saved by a user
 */
export async function isEventSaved(eventId: string, userId: string): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('saved_events')
            .select('id')
            .eq('user_id', userId)
            .eq('event_id', eventId)
            .maybeSingle();

        if (error) throw error;

        return !!data;
    } catch (error) {
        console.error('Error checking if event is saved:', error);
        return false;
    }
}

/**
 * Get all saved events for a user with full event details
 */
export async function getSavedEvents(userId: string) {
    try {
        const { data, error } = await supabase
            .from('saved_events')
            .select(`
        id,
        saved_at,
        event:events(*)
      `)
            .eq('user_id', userId)
            .order('saved_at', { ascending: false });

        if (error) throw error;

        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error fetching saved events:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch saved events',
            data: []
        };
    }
}

/**
 * Get count of users who saved a specific event
 */
export async function getSavedCount(eventId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('saved_events')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId);

        if (error) throw error;

        return count || 0;
    } catch (error) {
        console.error('Error getting saved count:', error);
        return 0;
    }
}

/**
 * Toggle save status (save if not saved, unsave if saved)
 */
export async function toggleSaveEvent(eventId: string, userId: string) {
    try {
        const isSaved = await isEventSaved(eventId, userId);

        if (isSaved) {
            const result = await unsaveEvent(eventId, userId);
            return { ...result, saved: false };
        } else {
            const result = await saveEvent(eventId, userId);
            return { ...result, saved: true };
        }
    } catch (error) {
        console.error('Error toggling save event:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to toggle save',
            saved: false
        };
    }
}

/**
 * Get saved events count for a user
 */
export async function getUserSavedCount(userId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('saved_events')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw error;

        return count || 0;
    } catch (error) {
        console.error('Error getting user saved count:', error);
        return 0;
    }
}
