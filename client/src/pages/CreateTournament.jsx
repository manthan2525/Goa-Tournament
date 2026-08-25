import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  MapPin,
  IndianRupee,
  QrCode,
  Image as ImageIcon,
  FileText,
  Users,
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import api from '../services/api';
import { SPORTS_LIST, GOA_LOCATIONS, TOURNAMENT_FORMATS } from '../utils/constants';
import PrizeManager from '../components/PrizeManager';

const CreateTournament = () => {
  const navigate = useNavigate();

  const [prizes, setPrizes] = useState([
    { position: 1, title: '1st Prize', amount: 25000, description: 'Trophy + Medals' },
    { position: 2, title: '2nd Prize', amount: 15000, description: 'Runner Up Trophy' },
    { position: 3, title: '3rd Prize', amount: 10000, description: 'Bronze Trophy' },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    sport: 'Football',
    venue: '',
    location: null,
    startDate: '',
    endDate: '',
    startTime: '09:00 AM',
    registrationDeadline: '',
    registrationFee: 0,
    upiId: '',
    format: 'KNOCKOUT',
    maxTeams: 16,
    teamSize: 11,
    prizePool: '',
    rules: '',
    description: '',
    requireAadhaarVerification: false,
  });

  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.venue || !formData.startDate || !formData.endDate) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();

      Object.entries(formData).forEach(([key, val]) => {
        if (val !== null && typeof val === 'object' && !(val instanceof File)) {
          data.append(key, JSON.stringify(val));
        } else {
          data.append(key, val);
        }
      });

      data.append('prizes', JSON.stringify(prizes));

      if (qrCodeFile) {
        data.append('qrCode', qrCodeFile);
      }

      if (bannerFile) {
        data.append('bannerImage', bannerFile);
      }

      const res = await api.post('/tournaments', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        navigate(`/tournaments/${res.data.tournament._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create tournament.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button & Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-black text-3xl text-white">
            Host a New Tournament in Goa
          </h1>
          <p className="text-xs text-slate-400">
            Set up registration fees, UPI QR code payment, Aadhaar verification, and tournament format.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl glass-panel border border-slate-800 space-y-8">
        {/* Section 1: Basic Information */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> 1. Tournament Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tournament Title *
              </label>
              <input
                type="text"
                required
                name="name"
                placeholder="e.g. Goa Super Cup Football 2026"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sport Discipline *
              </label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              >
                {SPORTS_LIST.filter((s) => s !== 'All').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tournament Format *
              </label>
              <select
                name="format"
                value={formData.format}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              >
                {TOURNAMENT_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tournament Description
              </label>
              <textarea
                rows="3"
                name="description"
                placeholder="Describe your tournament, eligible teams, age categories, trophies..."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 2: Goa Venue & Timing */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <MapPin className="w-5 h-5" /> 2. Venue & Scheduling
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Exact Map Location *
              </label>
              <LocationPicker 
                location={formData.location}
                setLocation={(loc) => setFormData(prev => ({ ...prev, location: loc }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stadium / Arena Name *
              </label>
              <input
                type="text"
                required
                name="venue"
                placeholder="e.g. Tilak Maidan Stadium / Campal Complex"
                value={formData.venue}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Daily Match Start Time
              </label>
              <input
                type="text"
                name="startTime"
                placeholder="e.g. 09:00 AM"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tournament Start Date *
              </label>
              <input
                type="date"
                required
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tournament End Date *
              </label>
              <input
                type="date"
                required
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registration Deadline
              </label>
              <input
                type="date"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Capacity, Rules & Prize */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <Users className="w-5 h-5" /> 3. Capacity, Identity & Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Max Participating Teams *
              </label>
              <input
                type="number"
                min="2"
                max="64"
                required
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Team Squad Size
              </label>
              <input
                type="number"
                min="1"
                max="30"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-3">
              <PrizeManager prizes={prizes} onChange={setPrizes} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Prize Pool Summary Info
              </label>
              <input
                type="text"
                name="prizePool"
                placeholder="e.g. 1st: ₹50,000 | 2nd: ₹25,000"
                value={formData.prizePool}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:border-emerald-500"
              />
            </div>

            {/* Aadhaar Verification Toggle */}
            <div className="sm:col-span-3 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Enable Mandatory Aadhaar / ID Card Verification
                </p>
                <p className="text-[11px] text-slate-400">
                  Participants must upload an Aadhaar card or government ID document when registering.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    requireAadhaarVerification: !prev.requireAadhaarVerification,
                  }))
                }
                className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                  formData.requireAadhaarVerification ? 'bg-emerald-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                    formData.requireAadhaarVerification ? 'translate-x-6' : 'translate-x-0'
                  }`}
                ></span>
              </button>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Rules & Regulations
              </label>
              <textarea
                rows="3"
                name="rules"
                placeholder="List game timing, penalty shootout rules, referee instructions..."
                value={formData.rules}
                onChange={handleChange}
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 4: UPI Payment & QR Setup */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-emerald-400 border-b border-slate-800 pb-2 flex items-center gap-2">
            <IndianRupee className="w-5 h-5" /> 4. UPI Payment & Visuals
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registration Fee (₹) * (0 for Free Entry)
              </label>
              <input
                type="number"
                min="0"
                required
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Organizer UPI ID (for receiving player fees)
              </label>
              <input
                type="text"
                name="upiId"
                placeholder="e.g. goasports@okaxis"
                value={formData.upiId}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-white focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Custom UPI QR Code Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQrCodeFile(e.target.files[0])}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Upload Tournament Banner Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3.5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            {submitting ? 'Creating Tournament...' : 'Publish Tournament & Open Registrations'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTournament;
