import React, { useState } from 'react';
import { X, Users, User, Phone, Plus, Trash2, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const RegisterModal = ({ tournament, onClose, onSuccess }) => {
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [playersList, setPlayersList] = useState([
    { name: '', jerseyNumber: '', role: 'Captain' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const addPlayerField = () => {
    setPlayersList([...playersList, { name: '', jerseyNumber: '', role: 'Player' }]);
  };

  const removePlayerField = (index) => {
    if (playersList.length > 1) {
      setPlayersList(playersList.filter((_, i) => i !== index));
    }
  };

  const handlePlayerChange = (index, field, value) => {
    const updated = [...playersList];
    updated[index][field] = value;
    setPlayersList(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teamName || !captainName || !contactPhone) {
      setError('Please fill in team name, captain name, and contact phone number.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        tournamentId: tournament._id,
        teamName,
        captainName,
        contactPhone,
        playersList: playersList.filter((p) => p.name.trim() !== ''),
      };

      const res = await api.post('/registrations', payload);
      if (res.data.success) {
        onSuccess(res.data);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col my-auto rounded-2xl glass-panel border border-slate-700/80 shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-white">Register Squad</h3>
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
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Team & Captain Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Team / Club Name *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Salcete Strikers FC"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Captain / In-Charge Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Fernandes"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Contact Phone / WhatsApp *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                placeholder="e.g. +91 98221 XXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Player Roster */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Squad Roster ({playersList.length} Players)
              </label>
              <button
                type="button"
                onClick={addPlayerField}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 min-h-[36px] px-2 py-1 rounded-lg bg-emerald-500/10"
              >
                <Plus className="w-3.5 h-3.5" /> Add Player
              </button>
            </div>

            <div className="max-h-40 sm:max-h-48 overflow-y-auto space-y-2 pr-1">
              {playersList.map((player, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Player ${idx + 1} Name`}
                    value={player.name}
                    onChange={(e) => handlePlayerChange(idx, 'name', e.target.value)}
                    className="flex-1 min-h-[40px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Defender)"
                    value={player.role}
                    onChange={(e) => handlePlayerChange(idx, 'role', e.target.value)}
                    className="w-24 sm:w-32 min-h-[40px] px-2.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-emerald-500"
                  />
                  {playersList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlayerField(idx)}
                      className="p-2.5 text-slate-500 hover:text-rose-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fee Notice */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Entry Registration Fee:</span>
            <span className="font-bold text-white font-mono text-sm">
              {tournament.registrationFee === 0 ? 'FREE' : `₹${tournament.registrationFee.toLocaleString('en-IN')}`}
            </span>
          </div>

          {/* Submit */}
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
              className="px-6 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center"
            >
              {submitting
                ? 'Registering...'
                : tournament.registrationFee > 0
                ? 'Proceed to QR Payment'
                : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
