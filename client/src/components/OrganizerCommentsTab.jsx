import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Reply,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Loader2,
  ExternalLink,
  ShieldCheck,
  User as UserIcon,
  X,
  Search,
} from 'lucide-react';
import api from '../services/api';

const OrganizerCommentsTab = () => {
  const [stats, setStats] = useState({
    totalComments: 0,
    unansweredCount: 0,
    repliedCount: 0,
  });
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNANSWERED' | 'REPLIED'
  const [search, setSearch] = useState('');

  // Reply Modal State
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchOrganizerComments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/comments/organizer/overview');
      if (res.data?.success) {
        setStats(res.data.stats || { totalComments: 0, unansweredCount: 0, repliedCount: 0 });
        setRecentComments(res.data.recentComments || []);
      }
    } catch (err) {
      console.error('Fetch organizer comments error:', err);
      setError('Failed to load comments overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizerComments();
  }, [fetchOrganizerComments]);

  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!replyText || !replyText.trim() || !replyTarget) return;

    try {
      setSubmitting(true);
      const res = await api.post(`/comments/${replyTarget._id}/reply`, {
        text: replyText.trim(),
      });

      if (res.data?.success) {
        setReplyTarget(null);
        setReplyText('');
        setSuccessMsg('Reply sent successfully.');
        fetchOrganizerComments();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredComments = recentComments.filter((item) => {
    if (filter === 'UNANSWERED' && item.hasOrganizerReply) return false;
    if (filter === 'REPLIED' && !item.hasOrganizerReply) return false;

    if (search) {
      const q = search.toLowerCase();
      const matchText = item.text?.toLowerCase().includes(q);
      const matchAuthor = item.user?.name?.toLowerCase().includes(q);
      const matchTourney = item.tournament?.title?.toLowerCase().includes(q);
      if (!matchText && !matchAuthor && !matchTourney) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Header & KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Comments</span>
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white font-mono">
            {stats.totalComments}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unanswered Questions</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-amber-600 dark:text-amber-400 font-mono">
            {stats.unansweredCount}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Replied Questions</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="font-display font-black text-2xl sm:text-3xl text-emerald-600 dark:text-emerald-400 font-mono">
            {stats.repliedCount}
          </p>
        </div>
      </div>

      {/* Messages Alert */}
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              filter === 'ALL'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Questions ({recentComments.length})
          </button>

          <button
            onClick={() => setFilter('UNANSWERED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'UNANSWERED'
                ? 'bg-amber-500 text-slate-950'
                : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Unanswered ({stats.unansweredCount})</span>
          </button>

          <button
            onClick={() => setFilter('REPLIED')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'REPLIED'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Replied ({stats.repliedCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search questions or players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          💬 No questions match your selected filter or search query.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComments.map((item) => (
            <div
              key={item._id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              {/* Question Header & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {item.tournament?.title || 'Tournament'}
                  </span>

                  {item.hasOrganizerReply ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      REPLIED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      UNANSWERED
                    </span>
                  )}
                </div>

                <Link
                  to={`/tournaments/${item.tournament?._id || item.tournament}?tab=discussion#comment-${item._id}`}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 self-end sm:self-auto"
                >
                  <span>View in Tournament</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Player Question Card */}
              <div className="flex items-start gap-3">
                {item.user?.profilePhoto || item.user?.profileImage ? (
                  <img
                    src={item.user.profilePhoto || item.user.profileImage}
                    alt={item.user.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex-shrink-0">
                    {item.user?.name?.charAt(0)?.toUpperCase() || 'P'}
                  </div>
                )}

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{item.user?.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    "{item.text}"
                  </p>
                </div>
              </div>

              {/* Existing Replies or Quick Reply CTA */}
              {item.replies && item.replies.length > 0 ? (
                <div className="mt-2 pl-4 border-l-2 border-emerald-500 space-y-2">
                  {item.replies.map((reply) => (
                    <div
                      key={reply._id}
                      className="p-3 rounded-2xl bg-amber-500/10 dark:bg-amber-950/20 border border-amber-400/30 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Your Reply ({reply.user?.name}):</span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200">{reply.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      setReplyTarget(item);
                      setReplyText('');
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Reply to Question</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Organizer Reply to {replyTarget.user?.name}
                </h4>
              </div>
              <button onClick={() => setReplyTarget(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">{replyTarget.user?.name} asked:</span>
              <p className="text-slate-600 dark:text-slate-400">"{replyTarget.text}"</p>
            </div>

            <form onSubmit={handlePostReply} className="space-y-4">
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Type your official organizer reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setReplyTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Organizer Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerCommentsTab;
