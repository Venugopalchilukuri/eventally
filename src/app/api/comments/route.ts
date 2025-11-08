import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create Supabase client for server-side use
function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    }
  });
}

// GET - Fetch all comments for an event
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, popular, oldest

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Determine sort order
    let orderBy: any = { created_at: { ascending: false } };
    if (sortBy === 'popular') {
      orderBy = { likes_count: { ascending: false } };
    } else if (sortBy === 'oldest') {
      orderBy = { created_at: { ascending: true } };
    }

    const supabase = getSupabaseClient();

    // Fetch top-level comments (no parent)
    const { data: comments, error } = await supabase
      .from('event_comments')
      .select('*')
      .eq('event_id', eventId)
      .is('parent_comment_id', null)
      .order('is_pinned', { ascending: false })
      .order(Object.keys(orderBy)[0], orderBy[Object.keys(orderBy)[0]]);

    if (error) {
      console.error('Error fetching comments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // Fetch replies for each comment
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment: any) => {
        const { data: replies } = await supabase
          .from('event_comments')
          .select('*')
          .eq('parent_comment_id', comment.id)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || []
        };
      })
    );

    return NextResponse.json({
      success: true,
      comments: commentsWithReplies,
      count: comments?.length || 0
    });

  } catch (error: any) {
    console.error('Error in GET /api/comments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new comment or reply
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      eventId,
      userId,
      userEmail,
      userName,
      commentText,
      parentCommentId,
      isOrganizer
    } = body;

    // Validation
    if (!eventId || !userId || !userEmail || !userName || !commentText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (commentText.trim().length < 1) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Insert comment
    const { data: comment, error } = await supabase
      .from('event_comments')
      .insert([{
        event_id: eventId,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        comment_text: commentText.trim(),
        parent_comment_id: parentCommentId || null,
        is_organizer: isOrganizer || false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // If this is a reply, send notification to parent comment author
    if (parentCommentId) {
      // Fetch parent comment to get author email
      const { data: parentComment } = await supabase
        .from('event_comments')
        .select('user_email, user_name')
        .eq('id', parentCommentId)
        .single();

      if (parentComment && parentComment.user_email !== userEmail) {
        // Send notification (we'll implement this later)
        console.log(`📧 Would send reply notification to ${parentComment.user_email}`);
      }
    }

    return NextResponse.json({
      success: true,
      comment,
      message: 'Comment posted successfully'
    });

  } catch (error: any) {
    console.error('Error in POST /api/comments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
