import React, { useState } from 'react';
import { X, Edit3, Image as ImageIcon, Calendar, Clock, MapPin, IndianRupee, Users, ShieldAlert, ShieldCheck, Check } from 'lucide-react';
import api from '../services/api';
import { GOA_LOCATIONS, SPORTS_LIST, TOURNAMENT_FORMATS } from '../utils/constants';
import LocationPicker from './map/LocationPicker';

import PrizeManager from './PrizeManager';

const EditTournamentModal = ({ tournament, onClose, onUpdated }) => {
  const [name, setName] = useState(tournament.name || '');
  const [sport, setSport] = useState(tournament.sport || 'Football');
  const [venue, setVenue] = useState(tournament.venue || '');
  const [location, setLocation] = useState(tournament.location || null);
  const [startDate, setStartDate] = useState(tournament.startDate ? tournament.startDate.substring(0, 10) : '');
  const [endDate, setEndDate] = useState(tournament.endDate ? tournament.endDate.substring(0, 10) : '');
  const [startTime, setStartTime] = useState(tournament.startTime || '09:00 AM');
  const [registrationDeadline, setRegistrationDeadline] = useState(
    tournament.registrationDeadline ? tournament.registrationDeadline.substring(0, 10) : ''
  );
  const [registrationFee, setRegistrationFee] = useState(tournament.registrationFee ?? 0);
  const [upiId, setUpiId] = useState(tournament.upiId || '');
  const [format, setFormat] = useState(tournament.format || 'KNOCKOUT');
  const [maxTeams, setMaxTeams] = useState(tournament.maxTeams || 16);
  const [teamSize, setTeamSize] = useState(tournament.teamSize || 11);
  const [prizePool, setPrizePool] = useState(tournament.prizePool || '');
  const [prizes, setPrizes] = useState(
    tournament.prizes && tournament.prizes.length > 0
      ? tournament.prizes
      : [
          { position: 1, title: '1st Prize', amount: 25000, description: 'Trophy + Medals' },
          { position: 2, title: '2nd Prize', amount: 15000, description: 'Runner Up Trophy' },
          { position: 3, title: '3rd Prize', amount: 10000, description: 'Bronze Trophy' },
        ]
  );
  const [rules, setRules] = useState(tournament.rules || '');
  const [description, setDescription] = useState(tournament.description || '');
  const [requireAadhaarVerification, setRequireAadhaarVerification] = useState(
    tournament.requireAadhaarVerification || false
  );
  const [status, setStatus] = useState(tournament.status || 'REGISTRATION_OPEN');

  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(tournament.bannerImage || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !venue || !startDate || !endDate) {
      setError('Please fill in tournament name, venue, start date, and end date.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('sport', sport);
      formData.append('venue', venue.trim());
      
      if (location !== null && typeof location === 'object') {
        formData.append('location', JSON.stringify(location));
      } else {
        formData.append('location', location);
      }
      
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('startTime', startTime);
      formData.append('registrationDeadline', registrationDeadline || startDate);
      formData.append('registrationFee', registrationFee);
      formData.append('upiId', upiId.trim());
      formData.append('format', format);
      formData.append('maxTeams', maxTeams);
      formData.append('teamSize', teamSize);
      formData.append('prizePool', prizePool.trim());
      formData.append('prizes', JSON.stringify(prizes));
      formData.append('rules', rules.trim());
      formData.append('description', description.trim());
      formData.append('requireAadhaarVerification', requireAadhaarVerification);
      formData.append('status', status);

      if (bannerFile) {
        formData.append('banner', bannerFile);
      }

      const res = await api.put(`/tournaments/${tournament._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        onUpdated(res.data.tournament);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to update tournament.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col my-auto rounded-2xl glass-panel border border-slate-700 shadow-2xl p-4 sm:p-7 space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-lg sm:text-xl text-white">Edit Tournament</h3>
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

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
          {/* Banner Upload / Preview */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Tournament Banner Image
            </label>
            <div className="flex items-center gap-3">
              {bannerPreview ? (
                <div className="w-32 h-18 rounded-xl overflow-hidden border border-slate-700 relative group flex-shrink-0 bg-slate-900">
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                </div>
              ) : null}
              <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-3 text-center cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors">
                <ImageIcon className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <span className="text-slate-300 font-medium">Click to upload new banner (JPG, PNG, WEBP)</span>
                <input type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Tournament Name & Sport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tournament Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Sport *</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              >
                {SPORTS_LIST.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Venue & Goa District */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stadium / Venue *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">Exact Map Location *</label>
              <LocationPicker
                location={location}
                setLocation={setLocation}
              />
            </div>
          </div>

          {/* Dates & Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">End Date *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Daily Match Start Time</label>
              <input
                type="text"
                placeholder="e.g. 09:00 AM"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Registration Deadline & Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Registration Deadline</label>
              <input
                type="date"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Registration Fee (₹)</label>
              <input
                type="number"
                min="0"
                value={registrationFee}
                onChange={(e) => setRegistrationFee(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">UPI ID for Payments</label>
              <input
                type="text"
                placeholder="e.g. yourname@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Format, Max Teams, Team Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              >
                {TOURNAMENT_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Teams</label>
              <input
                type="number"
                min="2"
                max="64"
                value={maxTeams}
                onChange={(e) => setMaxTeams(Number(e.target.value))}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tournament Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              >
                <option value="UPCOMING">UPCOMING</option>
                <option value="REGISTRATION_OPEN">REGISTRATION_OPEN</option>
                <option value="REGISTRATION_CLOSED">REGISTRATION_CLOSED</option>
                <option value="ONGOING">ONGOING</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          {/* Aadhaar Verification Toggle */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-white font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Require Aadhaar Card Verification
              </p>
              <p className="text-[11px] text-slate-400">
                Participants must upload government ID / Aadhaar card document during registration.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setRequireAadhaarVerification(!requireAadhaarVerification)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                requireAadhaarVerification ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                  requireAadhaarVerification ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></span>
            </button>
          </div>

          {/* Prize Manager */}
          <div>
            <PrizeManager prizes={prizes} onChange={setPrizes} />
          </div>

          {/* Prize Pool & Rules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prize Pool Summary</label>
              <input
                type="text"
                placeholder="e.g. ₹50,000 + Trophy"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Description / Overview</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[42px] px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tournament Rules & Guidelines</label>
            <textarea
              rows="3"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="1. Standard official federation rules apply..."
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-emerald-500 leading-relaxed"
            ></textarea>
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
              className="px-6 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {submitting ? 'Saving Changes...' : 'Save Tournament Updates'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTournamentModal;
