import React, { useEffect, useState, useCallback } from 'react';
import {
  Radio,
  Search,
  Filter,
  Trash2,
  Edit,
  Zap,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Trophy,
  RefreshCw,
  Plus,
} from 'lucide-react';
import api from '../../services/api';
import { getSportLogo } from '../../utils/sportLogos';
import ScoreUpdateModal from '../../components/ScoreUpdateModal';
import ManualMatchModal from '../../components/ManualMatchModal';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All Matches' },
  { value: 'LIVE', label: '🔴 LIVE Now' },
  { value: 'SCHEDULED', label: 'Upcoming' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ABANDONED', label: 'Abandoned' },
];

const AdminLiveScores = () => {
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [tournamentId, setTournamentId] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  
  // Modals
  const [scoreModalMatch, setScoreModalMatch] = useState(null);
  const [editFixtureMatch, setEditFixtureMatch] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Tournaments for dropdown filter
  useEffect(() => {
    const fetchTournamentsList = async () => {
      try {
        const res = await api.get('/admin/tournaments?limit=100');
        if (res.data.success) {
          setTournaments(res.data.data.tournaments || []);
        }
      } catch (err) {
        console.error('Failed to load tournaments list', err);
      }
    };
    fetchTournamentsList();
  }, []);

  // Fetch Matches with search and filters
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page, limit: 12 });
      if (status && status !== 'ALL') params.set('status', status);
      if (tournamentId) params.set('tournamentId', tournamentId);
      if (search.trim()) params.set('search', search.trim());

      const res = await api.get(`/admin/matches?${params}`);
      if (res.data.success) {
        setMatches(res.data.data.matches || []);
        setPagination({
          total: res.data.data.total || 0,
          pages: res.data.data.pages || 1,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch matches.');
    } finally {
      setLoading(false);
    }
  }, [page, status, tournamentId, search]);

  useEffect(() => {
    const timer = setTimeout(fetchMatches, 300);
    return () => clearTimeout(timer);
  }, [fetchMatches]);

  // Handle Delete Match
  const handleDeleteMatch = async () => {
    if (!deleteModal) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/admin/matches/${deleteModal._id}`);
      setSuccessMsg('Match successfully deleted.');
      setDeleteModal(null);
      fetchMatches();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete match.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const statusBadge = (s) => {
    const map = {
      LIVE: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/50 font-bold animate-pulse',
      SCHEDULED: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
      COMPLETED: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
      ABANDONED: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    };
    return map[s] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white flex items-center gap-2.5">
            <Radio className="w-7 h-7 text-rose-600 dark:text-rose-400 animate-pulse" />
            Live Scores & Matches Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Real-time score update, fixture editing, and live match moderation.
          </p>
        </div>

        <button
          onClick={fetchMatches}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Refresh
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          ✓ {successMsg}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search teams, round, venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Tournament Filter */}
        <select
          value={tournamentId}
          onChange={(e) => {
            setTournamentId(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 max-w-[240px] truncate"
        >
          <option value="">All Tournaments</option>
          {tournaments.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.sport})
            </option>
          ))}
        </select>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse p-5"
            />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Radio className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">No Matches Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            There are no matches or live scores matching your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => {
            const tournamentName = m.tournament?.name || 'Tournament';
            const sport = m.tournament?.sport || 'Football';
            const logoPath = getSportLogo(sport);

            return (
              <div
                key={m._id}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs flex flex-col justify-between"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      <img src={logoPath} alt={sport} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{tournamentName}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {m.round} • #{m.matchNumber}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-mono border ${statusBadge(
                      m.status
                    )}`}
                  >
                    {m.status === 'LIVE' ? '🔴 LIVE' : m.status}
                  </span>
                </div>

                {/* Score Scoreboard */}
                <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-900 dark:text-white truncate max-w-[130px]">
                      {m.teamA?.name || 'Team 1'}
                    </span>
                    <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400 ml-2">
                      {m.scoreA?.display ?? m.scoreA?.current ?? 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-900 dark:text-white truncate max-w-[130px]">
                      {m.teamB?.name || 'Team 2'}
                    </span>
                    <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400 ml-2">
                      {m.scoreB?.display ?? m.scoreB?.current ?? 0}
                    </span>
                  </div>

                  {m.summary && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-700 truncate">
                      "{m.summary}"
                    </p>
                  )}
                </div>

                {/* Venue & Time */}
                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-mono">
                  <span>📍 {m.venueCourt || m.venue || 'Main Arena'}</span>
                  <span>{m.date ? `${m.date} ${m.time || ''}` : 'Scheduled'}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setScoreModalMatch(m)}
                    className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Update Score
                  </button>

                  <button
                    onClick={() => setEditFixtureMatch(m)}
                    title="Edit Match Details"
                    className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeleteModal(m)}
                    title="Delete Match"
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Page {page} of {pagination.pages} ({pagination.total} total matches)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Live Score Update Modal */}
      {scoreModalMatch && (
        <ScoreUpdateModal
          match={scoreModalMatch}
          sport={scoreModalMatch.tournament?.sport || 'Football'}
          onClose={() => setScoreModalMatch(null)}
          onSuccess={() => {
            setScoreModalMatch(null);
            fetchMatches();
          }}
        />
      )}

      {/* Edit Fixture Modal */}
      {editFixtureMatch && (
        <ManualMatchModal
          tournament={editFixtureMatch.tournament}
          editingMatch={editFixtureMatch}
          onClose={() => setEditFixtureMatch(null)}
          onSuccess={() => {
            setEditFixtureMatch(null);
            fetchMatches();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Delete Live Score / Match?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Are you sure you want to permanently delete match <strong className="text-slate-900 dark:text-white">"{deleteModal.teamA?.name} vs {deleteModal.teamB?.name}"</strong> ({deleteModal.round})?
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMatch}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Match'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveScores;
