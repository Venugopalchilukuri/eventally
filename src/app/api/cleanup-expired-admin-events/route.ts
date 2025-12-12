import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}

async function findExpiredAdminEvents() {
  const supabase = getSupabaseClient();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;

  const { data: pastDate, error: pastDateError } = await supabase
    .from('events')
    .select('*')
    .lt('date', todayStr);

  if (pastDateError) throw pastDateError;

  const { data: pastToday, error: pastTodayError } = await supabase
    .from('events')
    .select('*')
    .eq('date', todayStr)
    .lt('time', timeStr);

  if (pastTodayError) throw pastTodayError;

  const candidates = [...(pastDate || []), ...(pastToday || [])];
  if (candidates.length === 0) return [];

  const creatorIds = Array.from(new Set(candidates.map((e: any) => e.user_id).filter(Boolean)));
  if (creatorIds.length === 0) return [];

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, role')
    .in('id', creatorIds);

  if (profilesError) throw profilesError;

  const roleMap = new Map<string, string>((profiles || []).map((p: any) => [p.id, p.role]));
  const adminEvents = candidates.filter((e: any) => roleMap.get(e.user_id) === 'admin');
  return adminEvents;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    const expiredAdminEvents = await findExpiredAdminEvents();

    if (expiredAdminEvents.length === 0) {
      return NextResponse.json({ success: true, message: 'No expired admin events', deleted: 0 });
    }

    const ids = expiredAdminEvents.map((e: any) => e.id);
    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .in('id', ids);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted: ids.length, eventIds: ids });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
