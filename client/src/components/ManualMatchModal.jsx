import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, Users, ShieldAlert, Trash2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ROUND_OPTIONS = [
  'Quarter Final',
  'Semi Final',
  'Final',
  '3rd Place Playoff',
  'Round 1',
  'Round 2',
  'Group Stage - Match 1',
  'Group Stage - Match 2',
  'Group Stage - Match 3',
];

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Upcoming / Scheduled' },
  { value: 'LIVE', label: 'LIVE Now' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ABANDONED', label: 'Postponed / Cancelled' },
];

const ManualMatchModal = ({
  tournament,
  verifiedTeams = [],
  editingMatch = null,
  onClose,
  onSuccess,
}) => {
  const [round, setRound] = useState(editingMatch?.round || 'Quarter Final');
  const [matchNumber, setMatchNumber] = useState(editingMatch?.matchNumber || 1);
  const [teamAName, setTeamAName] = useState(editingMatch?.teamA?.name || '');
  const [teamBName, setTeamBName] = useState(editingMatch?.teamB?.name || '');
  const [teamARegId, setTeamARegId] = useState(editingMatch?.teamA?.registrationId?._id || editingMatch?.teamA?.registrationId || '');
  const [teamBRegId, setTeamBRegId] = useState(editingMatch?.teamB?.registrationId?._id || editingMatch?.teamB?.registrationId || '');
  const [date, setDate] = useState(editingMatch?.date || '');
  const [time, setTime] = useState(editingMatch?.time || tournament?.startTime || '05:00 PM');
  const [venue, setVenue] = useState(editingMatch?.venueCourt || editingMatch?.venue || tournament?.venue || '');
  const [status, setStatus] = useState(editingMatch?.status || 'SCHEDULED');
  const [summary, setSummary] = useState(editingMatch?.summary || '');

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const handleSelectTeamA = (teamName) => {
    setTeamAName(teamName);
    const reg = verifiedTeams.find((t) => t.teamName === teamName);
    if (reg) setTeamARegId(reg._id);
  };

  const handleSelectTeamB = (teamName) => {
    setTeamBName(teamName);
    const reg = verifiedTeams.find((t) => t.teamName === teamName);
    if (reg) setTeamBRegId(reg._id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teamAName || !teamBName) {
      setError('Please specify both Team A and Team B names.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        tournamentId: tournament._id,
        round,
        matchNumber: Number(matchNumber) || 1,
        teamA: { name: teamAName.trim(), registrationId: teamARegId || null },
        teamB: { name: teamBName.trim(), registrationId: teamBRegId || null },
        date,
        time,
        venueCourt: venue.trim(),
        venue: venue.trim(),
        status,
        summary: summary.trim(),
      };

      let res;
      if (editingMatch) {
        res = await api.put(`/matches/${editingMatch._id}/details`, payload);
      } else {
        res = await api.post('/matches/manual', payload);
      }

      if (res.data.success) {
        onSuccess(res.data.match);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save fixture.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingMatch) return;
    if (!window.confirm('Are you sure you want to delete this fixture match?')) return;

    try {
      setDeleting(true);
      const res = await api.delete(`/matches/${editingMatch._id}`);
      if (res.data.success) {
        onSuccess(null, true); // true indicates deleted
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete match.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg flex flex-col my-auto rounded-2xl glass-panel border border-slate-700/80 shadow-2xl p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-display font-bold text-lg text-white">
              {editingMatch ? 'Edit Fixture Match' : 'Create Manual Fixture'}
            </h3>
            <p className="text-xs text-emerald-400 font-medium truncate max-w-[240px] sm:max-w-md">
              {tournament.name}
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
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Round & Match Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Round *</label>
              <select
                value={round}
                onChange={(e) => setRound(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500"
              >
                {ROUND_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Match Number #</label>
              <input
                type="number"
                min="1"
                required
                value={matchNumber}
                onChange={(e) => setMatchNumber(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Team A Selection / Input */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label className="block font-bold text-emerald-400">Team A *</label>
            {verifiedTeams.length > 0 && (
              <select
                onChange={(e) => handleSelectTeamA(e.target.value)}
                value={teamAName}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white mb-1"
              >
                <option value="">-- Select from Confirmed Squads --</option>
                {verifiedTeams.map((t) => (
                  <option key={t._id} value={t.teamName}>
                    {t.teamName} (Capt: {t.captainName})
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              required
              placeholder="Or type Team A Name"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* Team B Selection / Input */}
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label className="block font-bold text-teal-400">Team B *</label>
            {verifiedTeams.length > 0 && (
              <select
                onChange={(e) => handleSelectTeamB(e.target.value)}
                value={teamBName}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white mb-1"
              >
                <option value="">-- Select from Confirmed Squads --</option>
                {verifiedTeams.map((t) => (
                  <option key={t._id} value={t.teamName}>
                    {t.teamName} (Capt: {t.captainName})
                  </option>
                ))}
              </select>
            )}
            <input
              type="text"
              required
              placeholder="Or type Team B Name"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-teal-500"
            />
          </div>

          {/* Date, Time, Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Date</label>
              <input
                type="text"
                placeholder="e.g. 25 Aug 2026"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Time</label>
              <input
                type="text"
                placeholder="e.g. 5:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Venue / Pitch</label>
              <input
                type="text"
                placeholder="e.g. Asolna Turf / Court 1"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Match Status */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Match Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-emerald-500"
            >
              {STATUS_OPTIONS.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Optional Note / Summary */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Summary / Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Winner advances to Semi Final"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-3">
            {editingMatch ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                {deleting ? 'Deleting...' : 'Delete Match'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md"
              >
                {submitting
                  ? 'Saving...'
                  : editingMatch
                  ? 'Update Fixture'
                  : 'Create Fixture'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualMatchModal;
