import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  max_attendees?: number;
  current_attendees: number;
  image_url?: string;
  created_at: string;
  user_id?: string;
}

export interface EventInsert {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  category: string;
  max_attendees?: number;
  image_url?: string;
  user_id?: string;
}
