"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommentItem from './CommentItem';

interface Comment {
  id: string;
  event_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  comment_text: string;
  parent_comment_id: string | null;
  is_organizer: boolean;
  is_pinned: boolean;
  is_answer: boolean;
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

interface EventCommentsProps {
  eventId: string;
  organizerUserId: string;
}

export default function EventComments({ eventId, organizerUserId }: EventCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, popular, oldest

  // Fetch comments
  useEffect(() => {
    fetchComments();
  }, [eventId, sortBy]);

  async function fetchComments() {
    try {
      setLoading(true);
      const response = await fetch(`/api/comments?eventId=${eventId}&sortBy=${sortBy}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handlePostComment() {
    if (!user) {
      alert('Please login to post a comment');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      setPosting(true);
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          commentText: newComment,
          parentCommentId: null,
          isOrganizer: user.id === organizerUserId
        })
      });

      const data = await response.json();

      if (data.success) {
        setNewComment('');
        fetchComments(); // Refresh comments
      } else {
        alert(data.error || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment');
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          💬 Discussion
          {comments.length > 0 && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({comments.length} {comments.length === 1 ? 'comment' : 'comments'})
            </span>
          )}
        </h2>

        {/* Sort options */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Popular</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Post comment form */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Ask a question or leave a comment..." : "Login to post a comment"}
          disabled={!user || posting}
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
        />
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user ? (
              <span>Posting as <strong>{user.user_metadata?.display_name || user.email?.split('@')[0]}</strong></span>
            ) : (
              <span>Please <a href="/login" className="text-purple-600 hover:text-purple-700">login</a> to comment</span>
            )}
          </div>
          
          <button
            onClick={handlePostComment}
            disabled={!user || !newComment.trim() || posting}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {posting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-4xl mb-2">💭</div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No comments yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Be the first to ask a question or leave a comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              eventId={eventId}
              organizerUserId={organizerUserId}
              onUpdate={fetchComments}
            />
          ))}
        </div>
      )}
    </div>
  );
}
