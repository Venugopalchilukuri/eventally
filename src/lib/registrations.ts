import { supabase } from "./supabase";

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  user_email: string;
  registered_at: string;
}

export async function registerForEvent(eventId: string, userId: string, userEmail: string) {
  try {
    const { data, error } = await supabase
      .from("registrations")
      .insert([
        {
          event_id: eventId,
          user_id: userId,
          user_email: userEmail,
        },
      ])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function unregisterFromEvent(eventId: string, userId: string) {
  try {
    const { error } = await supabase
      .from("registrations")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function checkIfRegistered(eventId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("registrations")
      .select("id")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single();

    if (error) return false;
    return !!data;
  } catch (err) {
    return false;
  }
}

export async function getUserRegistrations(userId: string) {
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

export async function getEventRegistrations(eventId: string) {
  try {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: true });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}
