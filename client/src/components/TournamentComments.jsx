import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Reply,
  Edit2,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Shield,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  Loader2,
  LogIn,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

// Helper for relative time format (e.g. "2h ago", "Just now")
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Just now';
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TournamentComments = ({ tournament, isOrganizer: isPropOrganizer }) => {
  const { user, isAuthenticated } = useAuth();
  const socket = useSocket();

  const tournamentId = tournament?._id || tournament?.id;
  const isTournamentOrganizer =
    isPropOrganizer || (user && tournament?.organizer && (tournament.organizer._id || tournament.organizer) === user._id);
  const isAdmin = user?.role === 'ADMIN';

  // Component States
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState('newest'); // 'newest', 'oldest', 'most_liked'
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Comment Input State
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply Modal / Inline State
  const [replyTarget, setReplyTarget] = useState(null); // comment object to reply to
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Edit State
  const [editingComment, setEditingComment] = useState(null); // comment being edited
  const [editText, setEditText] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Confirmation Modal State
  const [deletingComment, setDeletingComment] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Fetch comments
  const fetchComments = useCallback(
    async (pageNum = 1, append = false) => {
      if (!tournamentId) return;

      try {
        if (pageNum === 1) setLoading(true);
        else setLoadingMore(true);

        const res = await api.get(`/tournaments/${tournamentId}/comments`, {
          params: { page: pageNum, limit: 10, sort },
        });

        if (res.data?.success) {
          setTotalComments(res.data.totalComments || 0);
          setUnansweredCount(res.data.unansweredCount || 0);
          setHasMore(res.data.hasMore || false);
          setPage(pageNum);

          if (append) {
            setComments((prev) => [...prev, ...(res.data.comments || [])]);
          } else {
            setComments(res.data.comments || []);
          }
        }
      } catch (err) {
        console.error('Fetch comments error:', err);
        setError('Unable to load discussion comments.');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [tournamentId, sort]
  );

  useEffect(() => {
    fetchComments(1, false);
  }, [fetchComments]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !tournamentId) return;

    socket.emit('join_tournament', tournamentId);

    const handleCommentAdded = () => {
      fetchComments(1, false);
    };

    const handleCommentUpdated = () => {
      fetchComments(1, false);
    };

    const handleCommentDeleted = () => {
      fetchComments(1, false);
    };

    const handleLikeToggled = () => {
      fetchComments(1, false);
    };

    socket.on('comment_added', handleCommentAdded);
    socket.on('comment_reply_added', handleCommentAdded);
    socket.on('comment_updated', handleCommentUpdated);
    socket.on('comment_deleted', handleCommentDeleted);
    socket.on('comment_like_toggled', handleLikeToggled);

    return () => {
      socket.emit('leave_tournament', tournamentId);
      socket.off('comment_added', handleCommentAdded);
      socket.off('comment_reply_added', handleCommentAdded);
      socket.off('comment_updated', handleCommentUpdated);
      socket.off('comment_deleted', handleCommentDeleted);
      socket.off('comment_like_toggled', handleLikeToggled);
    };
  }, [socket, tournamentId, fetchComments]);

  // Handle Post Main Comment
  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText || !commentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }

    if (commentText.trim().length > 500) {
      setError('Comment is too long (maximum 500 characters).');
      return;
    }

    setError('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      const res = await api.post(`/tournaments/${tournamentId}/comments`, {
        text: commentText.trim(),
      });

      if (res.data?.success) {
        setCommentText('');
        setSuccessMsg('Comment posted successfully.');
        fetchComments(1, false);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Your comment could not be posted. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Post Reply
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText || !replyText.trim() || !replyTarget) {
      setError('Reply text cannot be empty.');
      return;
    }

    if (replyText.trim().length > 500) {
      setError('Reply is too long (maximum 500 characters).');
      return;
    }

    setError('');

    try {
      setReplySubmitting(true);
      const res = await api.post(`/comments/${replyTarget._id}/reply`, {
        text: replyText.trim(),
      });

      if (res.data?.success) {
        setReplyText('');
        setReplyTarget(null);
        setSuccessMsg('Reply posted successfully.');
        fetchComments(1, false);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Your reply could not be posted. Please try again.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editText || !editText.trim() || !editingComment) return;

    try {
      setEditSubmitting(true);
      const res = await api.put(`/comments/${editingComment._id}`, {
        text: editText.trim(),
      });

      if (res.data?.success) {
        setEditingComment(null);
        setEditText('');
        setSuccessMsg('Comment updated.');
        fetchComments(1, false);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update comment.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingComment) return;

    try {
      setDeleteSubmitting(true);
      const res = await api.delete(`/comments/${deletingComment._id}`);

      if (res.data?.success) {
        setDeletingComment(null);
        setSuccessMsg('Comment deleted.');
        fetchComments(1, false);
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete comment.');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Handle Toggle Like
  const handleToggleLike = async (commentId) => {
    if (!isAuthenticated) {
      setError('Please log in to like comments.');
      return;
    }

    try {
      const res = await api.post(`/comments/${commentId}/like`);
      if (res.data?.success) {
        // Optimistic UI update
        setComments((prev) =>
          prev.map((c) => {
            if (c._id === commentId) {
              return { ...c, likesCount: res.data.likesCount, isLikedByMe: res.data.isLikedByMe };
            }
            if (c.replies) {
              const updatedReplies = c.replies.map((r) =>
                r._id === commentId ? { ...r, likesCount: res.data.likesCount, isLikedByMe: res.data.isLikedByMe } : r
              );
              return { ...c, replies: updatedReplies };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Like toggle error:', err);
    }
  };

  return (
    <div id="tournament-discussion" className="space-y-6 text-slate-900 dark:text-white">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-display font-black text-xl text-slate-900 dark:text-white tracking-tight">
              Tournament Discussion
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              {totalComments} {totalComments === 1 ? 'Comment' : 'Comments'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Ask questions, clarify match schedules, or chat with tournament organizers & players.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:border-emerald-500 outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_liked">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Global Error / Success Messages */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Comment Input Box */}
      {isAuthenticated ? (
        <form onSubmit={handlePostComment} className="space-y-3">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              {user?.profilePhoto || user?.profileImage ? (
                <img
                  src={user.profilePhoto || user.profileImage}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-200 dark:border-emerald-800">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</span>
                <span className="ml-2 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {user.role === 'ORGANIZER' && isTournamentOrganizer
                    ? 'ORGANIZER'
                    : user.role === 'ADMIN'
                    ? 'ADMIN'
                    : 'PLAYER'}
                </span>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Ask a question or leave a comment about rules, schedules, or venue details..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] font-medium text-slate-400">
                {commentText.length}/500
              </span>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="px-5 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Guest Login CTA Card */
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <MessageSquare className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Have a question for the organizer?</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Please sign in to your GoaSportX account to post comments, ask questions, or interact with organizers.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Comment</span>
          </Link>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
              </div>
              <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && comments.length === 0 && (
        <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 my-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-base text-slate-900 dark:text-white">💬 No comments yet</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Be the first to ask a question or start a discussion about this tournament.
          </p>
        </div>
      )}

      {/* Comments List */}
      {!loading && comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((item) => {
            const isOwner = user && item.user?._id === user._id;
            const canDelete = isOwner || isTournamentOrganizer || isAdmin;

            return (
              <div
                key={item._id}
                id={`comment-${item._id}`}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Comment Author Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {item.user?.profilePhoto || item.user?.profileImage ? (
                      <img
                        src={item.user.profilePhoto || item.user.profileImage}
                        alt={item.user.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                        {item.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {item.user?.name || 'Anonymous User'}
                        </span>

                        {/* Role Badge */}
                        {item.isOrganizerReply || (item.user?.role === 'ORGANIZER' && isTournamentOrganizer) ? (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-500" />
                            ORGANIZER
                          </span>
                        ) : item.user?.role === 'ADMIN' ? (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            ADMIN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                            PLAYER
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {formatRelativeTime(item.createdAt)}
                        {item.isEdited && <span className="italic">(edited)</span>}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-2">
                    {isOwner && (
                      <button
                        onClick={() => {
                          setEditingComment(item);
                          setEditText(item.text);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Comment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => setDeletingComment(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Delete Comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Comment Content */}
                {editingComment?._id === item._id ? (
                  <form onSubmit={handleEditSubmit} className="space-y-2 pt-1">
                    <textarea
                      rows={2}
                      maxLength={500}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingComment(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={editSubmitting || !editText.trim()}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500"
                      >
                        {editSubmitting ? 'Saving...' : 'Save Edit'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line pl-1">
                    {item.text}
                  </p>
                )}

                {/* Card Footer: Reactions & Reply Button */}
                <div className="flex items-center gap-4 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <button
                    onClick={() => handleToggleLike(item._id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-colors font-semibold ${
                      item.isLikedByMe
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${item.isLikedByMe ? 'fill-emerald-500' : ''}`} />
                    <span>{item.likesCount || 0}</span>
                  </button>

                  {/* Reply Button (visible to Organizer & logged in users) */}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        setReplyTarget(item);
                        setReplyText('');
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-semibold"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{isTournamentOrganizer ? 'Reply as Organizer' : 'Reply'}</span>
                    </button>
                  )}
                </div>

                {/* Organizer & User Nested Replies Section */}
                {item.replies && item.replies.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 space-y-3 pl-3 sm:pl-6 border-l-2 border-slate-200 dark:border-slate-800">
                    {item.replies.map((reply) => {
                      const isReplyOwner = user && reply.user?._id === user._id;
                      const canDeleteReply = isReplyOwner || isTournamentOrganizer || isAdmin;

                      return (
                        <div
                          key={reply._id}
                          id={`reply-${reply._id}`}
                          className={`p-3.5 rounded-2xl text-xs space-y-2 transition-all ${
                            reply.isOrganizerReply
                              ? 'bg-amber-500/10 dark:bg-amber-950/20 border-2 border-amber-400/40 dark:border-amber-700/50'
                              : 'bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              {reply.user?.profilePhoto || reply.user?.profileImage ? (
                                <img
                                  src={reply.user.profilePhoto || reply.user.profileImage}
                                  alt={reply.user.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] border border-emerald-200 dark:border-emerald-800">
                                  {reply.user?.name?.charAt(0)?.toUpperCase() || 'O'}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 dark:text-white">
                                    {reply.user?.name}
                                  </span>

                                  {reply.isOrganizerReply ? (
                                    <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1">
                                      <ShieldCheck className="w-3 h-3" />
                                      ORGANIZER
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      PLAYER
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {formatRelativeTime(reply.createdAt)}
                                  {reply.isEdited && <span className="italic"> (edited)</span>}
                                </span>
                              </div>
                            </div>

                            {/* Reply Action Buttons */}
                            <div className="flex items-center gap-1">
                              {isReplyOwner && (
                                <button
                                  onClick={() => {
                                    setEditingComment(reply);
                                    setEditText(reply.text);
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                  title="Edit Reply"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                              {canDeleteReply && (
                                <button
                                  onClick={() => setDeletingComment(reply)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                                  title="Delete Reply"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Reply Text */}
                          {editingComment?._id === reply._id ? (
                            <form onSubmit={handleEditSubmit} className="space-y-2 pt-1">
                              <textarea
                                rows={2}
                                maxLength={500}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-emerald-500 rounded-xl text-xs text-slate-900 dark:text-white resize-none"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingComment(null)}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="submit"
                                  disabled={editSubmitting}
                                  className="px-3 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg"
                                >
                                  Save Edit
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                              {reply.text}
                            </p>
                          )}

                          {/* Reply Like Toggle */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => handleToggleLike(reply._id)}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                                reply.isLikedByMe
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                              }`}
                            >
                              <ThumbsUp className={`w-3 h-3 ${reply.isLikedByMe ? 'fill-emerald-500' : ''}`} />
                              <span>{reply.likesCount || 0}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination / Load More Button */}
      {hasMore && !loading && (
        <div className="text-center pt-2">
          <button
            onClick={() => fetchComments(page + 1, true)}
            disabled={loadingMore}
            className="px-6 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 mx-auto shadow-xs"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                <span>Loading More...</span>
              </>
            ) : (
              <>
                <span>Load More Comments</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Reply to {replyTarget.user?.name || 'Comment'}
                </h4>
              </div>
              <button onClick={() => setReplyTarget(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">{replyTarget.user?.name}</span>
              <p className="text-slate-600 dark:text-slate-400 line-clamp-2">{replyTarget.text}</p>
            </div>

            <form onSubmit={handlePostReply} className="space-y-4">
              <textarea
                rows={3}
                maxLength={500}
                placeholder={
                  isTournamentOrganizer
                    ? 'Write official organizer reply...'
                    : 'Write your reply...'
                }
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replySubmitting || !replyText.trim()}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  {replySubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-base text-slate-900 dark:text-white">Delete Comment?</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingComment(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5"
              >
                {deleteSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentComments;
