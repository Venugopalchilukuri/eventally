import { supabase } from "./supabase";

export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  website: string | null;
  twitter: string | null;
  linkedin: string | null;
  github: string | null;
  created_at: string;
  updated_at: string;
}

// Get user profile by ID
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: null };
  }
}

// Get user profile by username
export async function getUserProfileByUsername(username: string) {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message, data: null };
  }
}

// Update or create user profile (upsert)
export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>) {
  try {
    // First check if profile exists
    const { data: existing } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single();

    let result;
    if (existing) {
      // Profile exists, update it
      result = await supabase
        .from("user_profiles")
        .update(profileData)
        .eq("id", userId)
        .select()
        .single();
    } else {
      // Profile doesn't exist, create it
      result = await supabase
        .from("user_profiles")
        .insert({ id: userId, ...profileData })
        .select()
        .single();
    }

    if (result.error) throw result.error;
    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err.message, data: null };
  }
}

// Get user's created events
export async function getUserCreatedEvents(userId: string) {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

// Get user's registered events
export async function getUserRegisteredEvents(userId: string) {
  try {
    const { data, error } = await supabase
      .from("registrations")
      .select(`
        *,
        events (*)
      `)
      .eq("user_id", userId)
      .order("registered_at", { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

// Get user statistics
export async function getUserStats(userId: string) {
  try {
    // Get created events count
    const { count: createdCount } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get registered events count
    const { count: registeredCount } = await supabase
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // Get total attendees across all user's events
    const { data: events } = await supabase
      .from("events")
      .select("current_attendees")
      .eq("user_id", userId);

    const totalAttendees = events?.reduce((sum, event) => sum + (event.current_attendees || 0), 0) || 0;

    return {
      success: true,
      data: {
        eventsCreated: createdCount || 0,
        eventsAttended: registeredCount || 0,
        totalAttendees,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      data: { eventsCreated: 0, eventsAttended: 0, totalAttendees: 0 },
    };
  }
}

// Check if username is available
export async function isUsernameAvailable(username: string, currentUserId?: string) {
  try {
    let query = supabase
      .from("user_profiles")
      .select("id")
      .eq("username", username);

    if (currentUserId) {
      query = query.neq("id", currentUserId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length === 0; // Available if no results
  } catch (err) {
    return false;
  }
}

// Format social media URLs
export function formatSocialUrl(platform: string, handle: string): string {
  if (!handle) return "";

  // Remove @ symbol if present
  const cleanHandle = handle.replace(/^@/, "");

  switch (platform) {
    case "twitter":
      return `https://twitter.com/${cleanHandle}`;
    case "linkedin":
      // Handle both profile URLs and usernames
      if (cleanHandle.startsWith("http")) return cleanHandle;
      return `https://linkedin.com/in/${cleanHandle}`;
    case "github":
      return `https://github.com/${cleanHandle}`;
    default:
      return cleanHandle;
  }
}

// Get default avatar based on name
export function getDefaultAvatar(name: string): string {
  const initial = name?.charAt(0).toUpperCase() || "U";
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[colorIndex];
}
