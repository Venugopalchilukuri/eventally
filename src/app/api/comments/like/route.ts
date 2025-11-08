import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    }
  });
}

// POST - Like a comment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { commentId, userId } = body;

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if already liked
    const { data: existing } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already liked this comment' },
        { status: 400 }
      );
    }

    // Insert like
    const { error } = await supabase
      .from('comment_likes')
      .insert([{
        comment_id: commentId,
        user_id: userId
      }]);

    if (error) {
      console.error('Error liking comment:', error);
      return NextResponse.json(
        { error: 'Failed to like comment' },
        { status: 500 }
      );
    }

    // Fetch updated like count
    const { data: comment } = await supabase
      .from('event_comments')
      .select('likes_count')
      .eq('id', commentId)
      .single();

    return NextResponse.json({
      success: true,
      likesCount: comment?.likes_count || 0,
      message: 'Comment liked successfully'
    });

  } catch (error: any) {
    console.error('Error in POST /api/comments/like:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Unlike a comment
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const userId = searchParams.get('userId');

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Delete like
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error unliking comment:', error);
      return NextResponse.json(
        { error: 'Failed to unlike comment' },
        { status: 500 }
      );
    }

    // Fetch updated like count
    const { data: comment } = await supabase
      .from('event_comments')
      .select('likes_count')
      .eq('id', commentId)
      .single();

    return NextResponse.json({
      success: true,
      likesCount: comment?.likes_count || 0,
      message: 'Comment unliked successfully'
    });

  } catch (error: any) {
    console.error('Error in DELETE /api/comments/like:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
