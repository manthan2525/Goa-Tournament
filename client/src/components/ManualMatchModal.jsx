import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Trash2, Zap, Users, Sparkles } from 'lucide-react';
import api from '../services/api';
import FixtureWarningModal from './FixtureWarningModal';
import { isTournamentStarted, getFixtureDeleteWarning } from '../utils/fixtureWarnings';

const ROUND_PRESETS = [
  { label: 'Round of 16 (8 Matches)', value: 'Round of 16', count: 8 },
  { label: 'Quarter Final (4 Matches)', value: 'Quarter Final', count: 4 },
  { label: 'Semi Final (2 Matches)', value: 'Semi Final', count: 2 },
  { label: 'Final (1 Match)', value: 'Final', count: 1 },
  { label: 'Group Stage (4 Matches)', value: 'Group Stage', count: 4 },
];

const ROUND_OPTIONS = [
  'Round of 16',
  'Quarter Final',
  'Semi Final',
  'Final',
  '3rd Place Playoff',
  'Round 1',
  'Round 2',
  'Group Stage',
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
  // Mode: 'quick' or 'single'
  const [mode, setMode] = useState(editingMatch ? 'single' : 'quick');

  // Single match state
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

  // Quick Round Builder state
  const [selectedPreset, setSelectedPreset] = useState('Round of 16');
  const [batchDate, setBatchDate] = useState(
    tournament?.startDate
      ? new Date(tournament.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : ''
  );
  const [batchVenue, setBatchVenue] = useState(tournament?.venue || '');
  const [batchStartTime, setBatchStartTime] = useState(tournament?.startTime || '04:00 PM');
  const [batchPairs, setBatchPairs] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  // Warning & Confirmation modal states
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningConfig, setWarningConfig] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);

  // Initialize batch pairs when preset changes
  useEffect(() => {
    const preset = ROUND_PRESETS.find((p) => p.value === selectedPreset) || ROUND_PRESETS[0];
    const pairs = [];
    for (let i = 0; i < preset.count; i++) {
      pairs.push({
        matchNumber: i + 1,
        teamA: '',
        teamB: '',
        date: batchDate,
        time: batchStartTime,
        venue: batchVenue,
      });
    }
    setBatchPairs(pairs);
  }, [selectedPreset]);

  // Update batch dates/venues when global batch defaults change
  const handleUpdateBatchDefaults = (newDate, newVenue, newTime) => {
    setBatchDate(newDate);
    setBatchVenue(newVenue);
    setBatchStartTime(newTime);
    setBatchPairs((prev) =>
      prev.map((p) => ({
        ...p,
        date: newDate,
        venue: newVenue,
        time: p.time || newTime,
      }))
    );
  };

  const handlePairChange = (index, field, value) => {
    setBatchPairs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Auto-pair confirmed squads into match slots
  const handleAutoPairSquads = () => {
    if (!verifiedTeams || verifiedTeams.length === 0) return;
    setBatchPairs((prev) => {
      const updated = [...prev];
      let teamIdx = 0;
      for (let i = 0; i < updated.length; i++) {
        const tA = verifiedTeams[teamIdx]?.teamName || '';
        const tB = verifiedTeams[teamIdx + 1]?.teamName || '';
        updated[i].teamA = tA;
        updated[i].teamB = tB;
        teamIdx += 2;
      }
      return updated;
    });
  };

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

  // Single Match Save Execution
  const executeSingleSave = async (payload) => {
    try {
      setSubmitting(true);
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

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teamAName.trim() || !teamBName.trim()) {
      setError('Please specify both Team A and Team B names.');
      return;
    }

    // STRICT VALIDATION: Same team cannot play against itself
    if (teamAName.trim().toLowerCase() === teamBName.trim().toLowerCase()) {
      setError('Team A and Team B cannot be the same team. Please select two different teams.');
      return;
    }

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

    const started = isTournamentStarted(tournament);
    const isLive = editingMatch?.status === 'LIVE';
    const isCompleted = editingMatch?.status === 'COMPLETED';
    const teamsChanged = editingMatch && (editingMatch.teamA?.name !== teamAName.trim() || editingMatch.teamB?.name !== teamBName.trim());

    if (editingMatch && (started || isLive || isCompleted) && teamsChanged) {
      setWarningConfig({
        title: isLive ? '🔴 Confirm Live Match Teams Change' : 'Confirm Fixture Team Change',
        level: isLive ? 'CRITICAL' : isCompleted ? 'HIGH' : 'NORMAL',
        details: [
          `Tournament status: ${tournament?.status || 'Started'}`,
          isLive ? 'WARNING: This match is currently LIVE! Changing team names will affect live spectator feeds.' : 'Changing team names in an active tournament may affect brackets and historical match records.',
        ],
        comparison: {
          oldA: editingMatch.teamA?.name || 'TBD',
          oldB: editingMatch.teamB?.name || 'TBD',
          newA: teamAName.trim(),
          newB: teamBName.trim(),
        },
        confirmText: 'Confirm & Save Change',
      });
      setPendingAction(() => () => executeSingleSave(payload));
      setWarningModalOpen(true);
      return;
    }

    await executeSingleSave(payload);
  };

  // Quick Batch Save Execution
  const executeBatchSave = async () => {
    try {
      setSubmitting(true);

      // Validate all pairs
      const validMatches = [];
      for (let i = 0; i < batchPairs.length; i++) {
        const pair = batchPairs[i];
        const tA = pair.teamA.trim();
        const tB = pair.teamB.trim();

        if (!tA && !tB) continue; // Skip completely empty rows

        if (!tA || !tB) {
          setError(`Match #${i + 1}: Please provide both Team A and Team B names.`);
          setSubmitting(false);
          return;
        }

        // STRICT VALIDATION: Same team cannot play against itself
        if (tA.toLowerCase() === tB.toLowerCase()) {
          setError(`Match #${i + 1}: Team A and Team B cannot be the same team ('${tA}'). Please select different teams.`);
          setSubmitting(false);
          return;
        }

        const regA = verifiedTeams.find((t) => t.teamName === tA);
        const regB = verifiedTeams.find((t) => t.teamName === tB);

        validMatches.push({
          matchNumber: pair.matchNumber,
          teamA: { name: tA, registrationId: regA?._id || null },
          teamB: { name: tB, registrationId: regB?._id || null },
          date: pair.date || batchDate,
          time: pair.time || batchStartTime,
          venue: pair.venue || batchVenue,
          venueCourt: pair.venue || batchVenue,
          round: selectedPreset,
          status: 'SCHEDULED',
        });
      }

      if (validMatches.length === 0) {
        setError('Please fill in at least one valid match pair.');
        setSubmitting(false);
        return;
      }

      const res = await api.post('/matches/manual/batch', {
        tournamentId: tournament._id,
        round: selectedPreset,
        matches: validMatches,
      });

      if (res.data.success) {
        onSuccess(null, false, true); // true = batch created
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create batch fixtures.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // If tournament has already started, show warning modal first
    if (isTournamentStarted(tournament)) {
      setWarningConfig({
        title: '⚠️ Tournament Already Started',
        level: 'NORMAL',
        details: [
          `Tournament status: ${tournament?.status || 'Started'}`,
          `You are adding ${batchPairs.filter(p => p.teamA && p.teamB).length} new manual fixtures for ${selectedPreset}.`,
        ],
        confirmText: 'Create Fixtures',
      });
      setPendingAction(() => () => executeBatchSave());
      setWarningModalOpen(true);
      return;
    }

    await executeBatchSave();
  };

  const executeDelete = async () => {
    if (!editingMatch) return;
    try {
      setDeleting(true);
      const res = await api.delete(`/matches/${editingMatch._id}`);
      if (res.data.success) {
        onSuccess(null, true);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete match.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    if (!editingMatch) return;
    const warning = getFixtureDeleteWarning(editingMatch, tournament);
    setWarningConfig(warning);
    setPendingAction(() => () => executeDelete());
    setWarningModalOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <div className={`relative w-full ${mode === 'quick' ? 'max-w-3xl' : 'max-w-lg'} flex flex-col my-auto rounded-2xl glass-panel border border-slate-700/80 shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto transition-all`}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
            <div>
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                {editingMatch ? 'Edit Fixture Match' : 'Add Manual Tournament Fixtures'}
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

          {/* Mode Switcher Tabs (Only when creating new matches) */}
          {!editingMatch && (
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-900/90 rounded-xl border border-slate-800 flex-shrink-0">
              <button
                type="button"
                onClick={() => setMode('quick')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'quick'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>⚡ Quick Round Builder (Round of 16 / QF)</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('single')}
                className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mode === 'single'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>📝 Single Match Editor</span>
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 flex-shrink-0">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: QUICK ROUND BUILDER (ROUND OF 16, QF, SF, etc.) */}
          {mode === 'quick' && !editingMatch && (
            <form onSubmit={handleBatchSubmit} className="space-y-4 text-xs">
              {/* Preset Selection */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Select Round Format &amp; Pairings
                  </label>
                  {verifiedTeams.length > 0 && (
                    <button
                      type="button"
                      onClick={handleAutoPairSquads}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Automatically pair registered squads into matches"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Auto-Pair Confirmed Squads ({verifiedTeams.length} Teams)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ROUND_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setSelectedPreset(preset.value)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        selectedPreset === preset.value
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <p className="font-bold text-xs truncate">{preset.value}</p>
                      <p className="text-[10px] opacity-80">{preset.count} Matches</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Global Defaults Bar (Date, Venue, Time) */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
                <p className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                  Default Match Schedule (Applies to all pairs)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 28 Aug 2026"
                      value={batchDate}
                      onChange={(e) => handleUpdateBatchDefaults(e.target.value, batchVenue, batchStartTime)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Venue / Pitch</label>
                    <input
                      type="text"
                      placeholder="e.g. Panaji Turf"
                      value={batchVenue}
                      onChange={(e) => handleUpdateBatchDefaults(batchDate, e.target.value, batchStartTime)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Start Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 04:00 PM"
                      value={batchStartTime}
                      onChange={(e) => handleUpdateBatchDefaults(batchDate, batchVenue, e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Pairs List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
                  <span>Match Pairings for {selectedPreset} ({batchPairs.length} Matches)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Team A and Team B cannot be identical</span>
                </div>

                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {batchPairs.map((pair, idx) => {
                    const isSameTeam = pair.teamA && pair.teamB && pair.teamA.trim().toLowerCase() === pair.teamB.trim().toLowerCase();

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition-all ${
                          isSameTeam
                            ? 'bg-rose-500/10 border-rose-500/60'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono font-bold text-emerald-400 text-xs">
                            Match #{pair.matchNumber} ({selectedPreset})
                          </span>
                          {isSameTeam && (
                            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" /> Same Team Selected!
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {/* Team A */}
                          <div>
                            <label className="block text-[10px] font-bold text-emerald-400 mb-1">Team A</label>
                            {verifiedTeams.length > 0 && (
                              <select
                                value={pair.teamA}
                                onChange={(e) => handlePairChange(idx, 'teamA', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs mb-1"
                              >
                                <option value="">-- Select Team A --</option>
                                {verifiedTeams.map((t) => (
                                  <option key={t._id} value={t.teamName}>
                                    {t.teamName}
                                  </option>
                                ))}
                              </select>
                            )}
                            <input
                              type="text"
                              placeholder="Or type Team A Name"
                              value={pair.teamA}
                              onChange={(e) => handlePairChange(idx, 'teamA', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>

                          {/* Team B */}
                          <div>
                            <label className="block text-[10px] font-bold text-teal-400 mb-1">Team B</label>
                            {verifiedTeams.length > 0 && (
                              <select
                                value={pair.teamB}
                                onChange={(e) => handlePairChange(idx, 'teamB', e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs mb-1"
                              >
                                <option value="">-- Select Team B --</option>
                                {verifiedTeams
                                  .filter((t) => t.teamName.trim().toLowerCase() !== pair.teamA.trim().toLowerCase())
                                  .map((t) => (
                                    <option key={t._id} value={t.teamName}>
                                      {t.teamName}
                                    </option>
                                  ))}
                              </select>
                            )}
                            <input
                              type="text"
                              placeholder="Or type Team B Name"
                              value={pair.teamB}
                              onChange={(e) => handlePairChange(idx, 'teamB', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                            />
                          </div>
                        </div>

                        {/* Optional Date & Time per row */}
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60">
                          <input
                            type="text"
                            placeholder="Date"
                            value={pair.date}
                            onChange={(e) => handlePairChange(idx, 'date', e.target.value)}
                            className="px-2 py-1 bg-slate-950/80 border border-slate-800 rounded text-[11px] text-slate-300"
                          />
                          <input
                            type="text"
                            placeholder="Time"
                            value={pair.time}
                            onChange={(e) => handlePairChange(idx, 'time', e.target.value)}
                            className="px-2 py-1 bg-slate-950/80 border border-slate-800 rounded text-[11px] text-slate-300"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
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
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  {submitting ? 'Creating Batch Fixtures...' : `Create All ${batchPairs.length} Fixtures for ${selectedPreset}`}
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: SINGLE MATCH EDITOR */}
          {(mode === 'single' || editingMatch) && (
            <form onSubmit={handleSingleSubmit} className="space-y-4 text-xs">
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
                    {verifiedTeams
                      .filter((t) => t.teamName.trim().toLowerCase() !== teamAName.trim().toLowerCase())
                      .map((t) => (
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
                    onClick={handleDeleteClick}
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
          )}
        </div>
      </div>

      {/* Confirmation / Warning Modal */}
      {warningConfig && (
        <FixtureWarningModal
          isOpen={warningModalOpen}
          title={warningConfig.title}
          level={warningConfig.level}
          details={warningConfig.details}
          comparison={warningConfig.comparison}
          confirmText={warningConfig.confirmText}
          cancelText="Cancel"
          loading={submitting || deleting}
          onConfirm={() => {
            setWarningModalOpen(false);
            if (pendingAction) pendingAction();
          }}
          onCancel={() => {
            setWarningModalOpen(false);
            setPendingAction(null);
          }}
        />
      )}
    </>
  );
};

export default ManualMatchModal;
