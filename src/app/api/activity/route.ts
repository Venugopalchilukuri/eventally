import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch recent registrations
    const { data: registrations } = await supabase
      .from('registrations')
      .select(`
        id,
        created_at,
        user_id,
        event:events(id, title)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Fetch recent likes
    const { data: likes } = await supabase
      .from('event_likes')
      .select(`
        id,
        created_at,
        user_id,
        event:events(id, title)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Fetch recent comments
    const { data: comments } = await supabase
      .from('event_comments')
      .select(`
        id,
        created_at,
        user_id,
        user_name,
        comment_text,
        event:events(id, title)
      `)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    // Fetch recent events
    const { data: events } = await supabase
      .from('events')
      .select('id, title, created_at, user_id')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Combine all activities
    const activities: any[] = [];

    // Add registrations
    registrations?.forEach((reg: any) => {
      if (reg.event) {
        activities.push({
          id: `reg-${reg.id}`,
          type: 'registration',
          timestamp: reg.created_at,
          eventTitle: reg.event.title,
          eventId: reg.event.id,
          userId: reg.user_id,
        });
      }
    });

    // Add likes
    likes?.forEach((like: any) => {
      if (like.event) {
        activities.push({
          id: `like-${like.id}`,
          type: 'like',
          timestamp: like.created_at,
          eventTitle: like.event.title,
          eventId: like.event.id,
          userId: like.user_id,
        });
      }
    });

    // Add comments
    comments?.forEach((comment: any) => {
      if (comment.event) {
        activities.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          timestamp: comment.created_at,
          eventTitle: comment.event.title,
          eventId: comment.event.id,
          userId: comment.user_id,
          userName: comment.user_name,
          commentText: comment.comment_text?.substring(0, 50) + '...',
        });
      }
    });

    // Add new events
    events?.forEach(event => {
      activities.push({
        id: `event-${event.id}`,
        type: 'new_event',
        timestamp: event.created_at,
        eventTitle: event.title,
        eventId: event.id,
        userId: event.user_id,
      });
    });

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Return top activities
    const topActivities = activities.slice(0, limit);

    return NextResponse.json({
      success: true,
      activities: topActivities,
      count: topActivities.length,
    });
  } catch (error: any) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
