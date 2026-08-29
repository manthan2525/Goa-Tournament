import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const DeleteTournamentModal = ({ tournament, onClose, onDeleted }) => {
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async (e) => {
    e.preventDefault();
    if (confirmText.toLowerCase() !== 'delete') {
      setError('Please type DELETE in capital letters to confirm.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.delete(`/tournaments/${tournament._id}`);
      if (res.data.success) {
        onDeleted(tournament._id);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete tournament.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md my-auto rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/50 shadow-2xl p-5 sm:p-7 space-y-4 overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Delete Tournament</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate max-w-[220px]">{tournament.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Alert */}
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-800 dark:text-rose-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Permanent Action Warning</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Deleting this tournament will permanently purge all associated squad registrations, match brackets, score history, and verified payment records.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
              Type <span className="text-rose-600 dark:text-rose-400 font-mono font-bold">DELETE</span> to confirm:
            </label>
            <input
              type="text"
              required
              placeholder="DELETE"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:border-rose-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || confirmText.toLowerCase() !== 'delete'}
              className="px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white shadow-md disabled:opacity-40 transition-all flex items-center justify-center gap-1.5"
            >
              {submitting ? 'Deleting Records...' : 'Permanently Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteTournamentModal;
