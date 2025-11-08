"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

interface CommentItemProps {
  comment: Comment;
  eventId: string;
  organizerUserId: string;
  onUpdate: () => void;
  isReply?: boolean;
}

export default function CommentItem({ comment, eventId, organizerUserId, onUpdate, isReply = false }: CommentItemProps) {
  const { user } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.comment_text);
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(comment.likes_count);

  const isOwner = user?.id === comment.user_id;
  const canEdit = isOwner;
  const canDelete = isOwner;

  // Format timestamp
  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  // Handle like
  async function handleLike() {
    if (!user) {
      alert('Please login to like comments');
      return;
    }

    try {
      if (liked) {
        // Unlike
        const response = await fetch(`/api/comments/like?commentId=${comment.id}&userId=${user.id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          setLiked(false);
          setLikesCount(data.likesCount);
        }
      } else {
        // Like
        const response = await fetch('/api/comments/like', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commentId: comment.id,
            userId: user.id
          })
        });
        const data = await response.json();
        if (data.success) {
          setLiked(true);
          setLikesCount(data.likesCount);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  }

  // Handle reply
  async function handleReply() {
    if (!user || !replyText.trim()) return;

    try {
      setLoading(true);
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          commentText: replyText,
          parentCommentId: comment.id,
          isOrganizer: user.id === organizerUserId
        })
      });

      const data = await response.json();
      if (data.success) {
        setReplyText('');
        setShowReplyForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    } finally {
      setLoading(false);
    }
  }

  // Handle edit
  async function handleEdit() {
    if (!editText.trim()) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${comment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentText: editText,
          userId: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setLoading(false);
    }
  }

  // Handle delete
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/comments/${comment.id}?userId=${user?.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`${isReply ? 'ml-12' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        {/* Comment header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {comment.user_name.charAt(0).toUpperCase()}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {comment.user_name}
                </span>
                
                {comment.is_organizer && (
                  <span className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium rounded">
                    Organizer
                  </span>
                )}
                
                {comment.is_pinned && (
                  <span className="text-yellow-500" title="Pinned">📌</span>
                )}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(comment.created_at)}
                {comment.created_at !== comment.updated_at && (
                  <span className="ml-2">(edited)</span>
                )}
              </div>
            </div>
          </div>

          {/* Actions menu */}
          {canEdit || canDelete ? (
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400"
                >
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Comment body */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleEdit}
                disabled={loading || !editText.trim()}
                className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.comment_text);
                }}
                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
            {comment.comment_text}
          </p>
        )}

        {/* Comment actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={handleLike}
            disabled={!user}
            className={`flex items-center gap-1 ${
              liked
                ? 'text-purple-600 dark:text-purple-400 font-medium'
                : 'text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <span>{liked ? '❤️' : '🤍'}</span>
            <span>{likesCount > 0 ? likesCount : 'Like'}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              disabled={!user}
              className="text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💬 Reply {comment.replies_count > 0 && `(${comment.replies_count})`}
            </button>
          )}
        </div>

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={handleReply}
                disabled={loading || !replyText.trim()}
                className="px-4 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyText('');
                }}
                className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              eventId={eventId}
              organizerUserId={organizerUserId}
              onUpdate={onUpdate}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
