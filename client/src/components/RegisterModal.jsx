import React, { useState } from 'react';
import { X, Users, User, Phone, Plus, Trash2, ShieldAlert, ShieldCheck, FileText, Upload } from 'lucide-react';
import api from '../services/api';

const RegisterModal = ({ tournament, onClose, onSuccess }) => {
  const [teamName, setTeamName] = useState('');
  const [captainName, setCaptainName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [playersList, setPlayersList] = useState([
    { name: '', jerseyNumber: '', role: 'Captain' },
  ]);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadhaarFileName, setAadhaarFileName] = useState('');
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

  const handleAadhaarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Aadhaar file must be under 10 MB.');
        return;
      }
      setAadhaarFile(file);
      setAadhaarFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!teamName || !captainName || !contactPhone) {
      setError('Please fill in team name, captain name, and contact phone number.');
      return;
    }

    if (tournament.requireAadhaarVerification && !aadhaarFile) {
      setError('Aadhaar Card document upload is mandatory for this tournament.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('tournamentId', tournament._id);
      formData.append('teamName', teamName.trim());
      formData.append('captainName', captainName.trim());
      formData.append('contactPhone', contactPhone.trim());
      formData.append(
        'playersList',
        JSON.stringify(playersList.filter((p) => p.name.trim() !== ''))
      );

      if (aadhaarFile) {
        formData.append('aadhaarDocument', aadhaarFile);
      }

      const res = await api.post('/registrations', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col my-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Register Squad</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate max-w-[240px] sm:max-w-md">
              {tournament.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2 flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Team & Captain Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Team / Club Name *
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Salcete Strikers FC"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Captain / In-Charge Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohit Fernandes"
                  value={captainName}
                  onChange={(e) => setCaptainName(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contact Phone / WhatsApp *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="tel"
                required
                placeholder="e.g. +91 98221 XXXXX"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Aadhaar Upload Requirement Notice if active */}
          {tournament.requireAadhaarVerification && (
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/50 space-y-2">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Aadhaar Card Document Required *</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                The organizer has enabled mandatory participant verification. Please upload a clear photo or PDF of your Aadhaar card or government ID.
              </p>
              <label className="flex items-center justify-between p-3 border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-400 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span className="text-xs text-slate-800 dark:text-slate-200 truncate">
                    {aadhaarFileName || 'Choose Aadhaar photo/PDF (JPG, PNG, PDF)'}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/50 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800/50 flex-shrink-0">
                  Browse
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleAadhaarChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Player Roster */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Squad Roster ({playersList.length} Players)
              </label>
              <button
                type="button"
                onClick={addPlayerField}
                className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 min-h-[36px] px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40"
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
                    className="flex-1 min-h-[40px] px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Defender)"
                    value={player.role}
                    onChange={(e) => handlePlayerChange(idx, 'role', e.target.value)}
                    className="w-24 sm:w-32 min-h-[40px] px-2.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500"
                  />
                  {playersList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlayerField(idx)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fee Notice */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Entry Registration Fee:</span>
            <span className="font-bold text-slate-900 dark:text-white font-mono text-sm">
              {tournament.registrationFee === 0 ? 'FREE' : `₹${tournament.registrationFee.toLocaleString('en-IN')}`}
            </span>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-md disabled:opacity-50 transition-all flex items-center justify-center"
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
