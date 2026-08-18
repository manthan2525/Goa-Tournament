import React, { useState } from 'react';
import { X, Zap, Plus, Minus, CheckCircle, ShieldAlert, Radio } from 'lucide-react';
import api from '../services/api';

const ScoreUpdateModal = ({ match, onClose, onUpdated }) => {
  const [scoreA, setScoreA] = useState(match?.scoreA?.current || 0);
  const [scoreB, setScoreB] = useState(match?.scoreB?.current || 0);
  const [status, setStatus] = useState(match?.status || 'SCHEDULED');
  const [summary, setSummary] = useState(match?.summary || '');
  const [venueCourt, setVenueCourt] = useState(match?.venueCourt || 'Main Arena');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleScoreChange = (team, delta) => {
    if (team === 'A') {
      setScoreA((prev) => Math.max(0, prev + delta));
    } else {
      setScoreB((prev) => Math.max(0, prev + delta));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const payload = {
        scoreA: {
          current: Number(scoreA),
          display: String(scoreA),
        },
        scoreB: {
          current: Number(scoreB),
          display: String(scoreB),
        },
        status,
        summary,
        venueCourt,
      };

      const res = await api.put(`/matches/${match._id}/score`, payload);
      if (res.data.success) {
        onUpdated(res.data.match);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update score.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col my-auto rounded-2xl glass-panel border border-slate-700 shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-bold text-lg sm:text-xl text-white">Live Scorepad</h3>
            </div>
            <p className="text-xs text-slate-400">
              Match #{match.matchNumber} • {match.round}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 overflow-y-auto pr-1 flex-1">
          {/* Interactive Scoreboard Counters */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-slate-900/90 p-3.5 sm:p-4 rounded-2xl border border-slate-800">
            {/* Team A Counter */}
            <div className="text-center space-y-2">
              <p className="text-xs font-bold text-white truncate px-1">
                {match.teamA?.name || 'Team A'}
              </p>
              <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">
                {scoreA}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScoreChange('A', -1)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScoreChange('A', 1)}
                  className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold flex items-center justify-center transition-all shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Team B Counter */}
            <div className="text-center space-y-2 border-l border-slate-800 pl-3 sm:pl-4">
              <p className="text-xs font-bold text-white truncate px-1">
                {match.teamB?.name || 'Team B'}
              </p>
              <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-400">
                {scoreB}
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScoreChange('B', -1)}
                  className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 flex items-center justify-center transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScoreChange('B', 1)}
                  className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold flex items-center justify-center transition-all shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          </div>

          {/* Match Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Match Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'SCHEDULED', label: 'Scheduled', color: 'border-slate-700 text-slate-300' },
                { val: 'LIVE', label: '🔴 LIVE', color: 'border-rose-500 bg-rose-500/10 text-rose-400 font-bold' },
                { val: 'COMPLETED', label: '✓ Final (FT)', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setStatus(item.val)}
                  className={`min-h-[44px] py-2 px-1.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${
                    status === item.val
                      ? `${item.color} ring-2 ring-emerald-500/40`
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Commentary / Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Live Commentary / Highlights Summary
            </label>
            <input
              type="text"
              placeholder="e.g. 78' Goal by Rohit Fernandes! Spectacular volley."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Court / Pitch */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pitch / Court
            </label>
            <input
              type="text"
              placeholder="e.g. Court 1 / Main Pitch"
              value={venueCourt}
              onChange={(e) => setVenueCourt(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800 flex-shrink-0">
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
              className="px-6 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              {submitting ? 'Broadcasting...' : 'Broadcast Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScoreUpdateModal;
