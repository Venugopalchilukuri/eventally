import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { eventId, userId } = await request.json();

    if (!eventId || !userId) {
      return NextResponse.json(
        { success: false, error: 'Missing eventId or userId' },
        { status: 400 }
      );
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('event_likes')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('event_likes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (deleteError) {
        return NextResponse.json(
          { success: false, error: deleteError.message },
          { status: 500 }
        );
      }

      // Get updated count
      const { count } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      return NextResponse.json({
        success: true,
        liked: false,
        likesCount: count || 0,
      });
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('event_likes')
        .insert({
          event_id: eventId,
          user_id: userId,
        });

      if (insertError) {
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }

      // Get updated count
      const { count } = await supabase
        .from('event_likes')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      return NextResponse.json({
        success: true,
        liked: true,
        likesCount: count || 0,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to check if user liked and get count
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const userId = searchParams.get('userId');

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Missing eventId' },
        { status: 400 }
      );
    }

    // Get likes count
    const { count } = await supabase
      .from('event_likes')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    let liked = false;
    if (userId) {
      // Check if user liked
      const { data } = await supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      liked = !!data;
    }

    return NextResponse.json({
      success: true,
      liked,
      likesCount: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
