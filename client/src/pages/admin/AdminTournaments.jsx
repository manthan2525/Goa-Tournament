import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Trash2, Edit, Eye, Trophy, ChevronLeft, ChevronRight, X, AlertCircle,
  Filter, SortAsc,
} from 'lucide-react';
import api from '../../services/api';
import { SPORTS_LIST, GOA_LOCATIONS, STATUS_COLORS } from '../../utils/constants';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'REGISTRATION_OPEN', label: 'Registration Open' },
  { value: 'REGISTRATION_CLOSED', label: 'Registration Closed' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ page, limit: 15, sort });
      if (search.trim()) params.set('search', search.trim());
      if (status) params.set('status', status);
      const res = await api.get(`/admin/tournaments?${params}`);
      if (res.data.success) {
        setTournaments(res.data.data.tournaments);
        setPagination({ total: res.data.data.total, pages: res.data.data.pages });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchTournaments, 300);
    return () => clearTimeout(timer);
  }, [fetchTournaments]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/admin/tournaments/${deleteModal._id}`);
      setSuccessMsg(`"${deleteModal.name}" has been deleted.`);
      setDeleteModal(null);
      fetchTournaments();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const statusStyle = (s) => {
    const map = {
      REGISTRATION_OPEN: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400',
      UPCOMING: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
      ONGOING: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400',
      COMPLETED: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      REGISTRATION_CLOSED: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400',
      CANCELLED: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400',
    };
    return map[s] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-600 dark:text-amber-400" /> Tournament Management
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{pagination.total} tournaments across all organizers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tournaments, sport, location…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 dark:hover:text-white"><X className="w-3.5 h-3.5" /></button>}
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
        >
          {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="startDate">Start Date</option>
          <option value="registrations">Most Registrations</option>
        </select>
      </div>

      {successMsg && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-300">{successMsg}</div>}
      {error && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-300">{error}</div>}

      {/* Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm text-slate-900 dark:text-white">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                {['Tournament', 'Sport', 'Organizer', 'Location', 'Start Date', 'Fee', 'Registrations', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" /></td>
                  ))}</tr>
                ))
              ) : tournaments.length === 0 ? (
                <tr><td colSpan="9" className="px-5 py-16 text-center text-slate-500 dark:text-slate-400">No tournaments found.</td></tr>
              ) : (
                tournaments.map((t) => (
                  <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {t.bannerImage ? (
                            <img src={t.bannerImage} alt={t.name} className="w-full h-full object-cover" />
                          ) : <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />}
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-white max-w-[160px] truncate">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{t.sport}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{t.organizer?.name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap truncate max-w-[120px]">
                      {typeof t.location === 'object' && t.location !== null ? t.location.address : t.location}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {new Date(t.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-700 dark:text-emerald-400">
                      {t.registrationFee === 0 ? 'FREE' : `₹${t.registrationFee}`}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-mono font-bold">
                        {t.registeredTeamsCount ?? 0}/{t.maxTeams}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${statusStyle(t.status)}`}>
                        {t.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/tournaments/${t._id}`} title="View" className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link to={`/admin/tournaments/${t._id}/edit`} title="Edit" className="p-1.5 rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button title="Delete" onClick={() => setDeleteModal(t)} className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Page {page} of {pagination.pages} ({pagination.total} total)</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 shadow-2xl p-6 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Delete Tournament?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{deleteModal.name}"</strong>?
                  This will also delete all associated registrations, matches, and payment records.
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setDeleteModal(null)} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition disabled:opacity-50">
                {deleteLoading ? 'Deleting…' : 'Delete Tournament'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTournaments;
