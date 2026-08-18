import React, { useState } from 'react';
import { X, Trophy, Award, Medal, ShieldAlert, Check } from 'lucide-react';
import api from '../services/api';

const DeclareWinnersModal = ({ tournament, teams = [], onClose, onUpdated }) => {
  const [winner, setWinner] = useState(tournament.winner || '');
  const [runnerUp, setRunnerUp] = useState(tournament.runnerUp || '');
  const [thirdPlace, setThirdPlace] = useState(tournament.thirdPlace || '');
  const [winnerType, setWinnerType] = useState(tournament.winnerType || 'TEAM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!winner.trim()) {
      setError('Please select or enter the champion / 1st place winner.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.put(`/tournaments/${tournament._id}/winners`, {
        winner: winner.trim(),
        runnerUp: runnerUp.trim(),
        thirdPlace: thirdPlace.trim(),
        winnerType,
      });

      if (res.data.success) {
        onUpdated(res.data.tournament);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to record tournament winners.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto rounded-2xl glass-panel border border-amber-500/30 shadow-2xl p-5 sm:p-7 space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Declare Tournament Winners</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-xs">{tournament.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Winner Type */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 font-semibold">Category Type:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
              <input
                type="radio"
                name="winnerType"
                value="TEAM"
                checked={winnerType === 'TEAM'}
                onChange={() => setWinnerType('TEAM')}
                className="text-emerald-500"
              />
              Team
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
              <input
                type="radio"
                name="winnerType"
                value="INDIVIDUAL"
                checked={winnerType === 'INDIVIDUAL'}
                onChange={() => setWinnerType('INDIVIDUAL')}
                className="text-emerald-500"
              />
              Individual / Player
            </label>
          </div>

          {/* 1st Place Champion */}
          <div>
            <label className="block text-amber-400 font-bold mb-1.5 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              🏆 Champion / 1st Place Winner *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Salcete Strikers FC or Rohit Fernandes"
              value={winner}
              onChange={(e) => setWinner(e.target.value)}
              list="squads-list"
              className="w-full min-h-[44px] px-3.5 py-2 bg-slate-900 border border-amber-500/50 rounded-xl text-white text-sm focus:border-amber-400 focus:outline-none ring-1 ring-amber-500/20"
            />
          </div>

          {/* 2nd Place Runner-Up */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-slate-300" />
              🥈 Runner-Up (2nd Place)
            </label>
            <input
              type="text"
              placeholder="e.g. Mapusa Mavericks FC"
              value={runnerUp}
              onChange={(e) => setRunnerUp(e.target.value)}
              list="squads-list"
              className="w-full min-h-[44px] px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* 3rd Place */}
          <div>
            <label className="block text-amber-600 font-semibold mb-1.5 flex items-center gap-1.5">
              <Medal className="w-4 h-4 text-amber-600" />
              🥉 3rd Place / Bronze
            </label>
            <input
              type="text"
              placeholder="e.g. Panaji Panthers FC"
              value={thirdPlace}
              onChange={(e) => setThirdPlace(e.target.value)}
              list="squads-list"
              className="w-full min-h-[44px] px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Datalist for fast auto-complete of verified teams */}
          <datalist id="squads-list">
            {teams.map((t, idx) => (
              <option key={idx} value={t.teamName || t.name} />
            ))}
          </datalist>

          <p className="text-[11px] text-slate-400 italic">
            Publishing winners will update the tournament status to <strong className="text-emerald-400 font-semibold">COMPLETED</strong> and prominently showcase the winners on the public details page.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {submitting ? 'Publishing...' : 'Publish Winners'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeclareWinnersModal;
