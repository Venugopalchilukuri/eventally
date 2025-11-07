import { supabase } from "./supabase";

export interface Profile {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      // Silently return false if table doesn't exist or other errors
      return false;
    }

    return data?.role === "admin";
  } catch (err) {
    // Silently return false on any error
    return false;
  }
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    return null;
  }
}

export async function getAllProfiles(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error in getAllProfiles:", err);
    return [];
  }
}

export async function updateUserRole(userId: string, newRole: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user role:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in updateUserRole:", err);
    return false;
  }
}
