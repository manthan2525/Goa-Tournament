import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { SPORTS_LIST, GOA_LOCATIONS, TOURNAMENT_FORMATS } from '../../utils/constants';
import LocationPicker from '../../components/map/LocationPicker';

const statusOptions = ['UPCOMING', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'DRAFT'];

const AdminEditTournament = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/tournaments/${id}`);
        if (res.data.success) {
          const t = res.data.data.tournament;
          setForm({
            name: t.name || '',
            sport: t.sport || 'Football',
            description: t.description || '',
            venue: t.venue || '',
            location: t.location || null,
            startDate: t.startDate ? t.startDate.split('T')[0] : '',
            endDate: t.endDate ? t.endDate.split('T')[0] : '',
            startTime: t.startTime || '09:00 AM',
            registrationDeadline: t.registrationDeadline ? t.registrationDeadline.split('T')[0] : '',
            registrationFee: t.registrationFee ?? 0,
            upiId: t.upiId || '',
            format: t.format || 'KNOCKOUT',
            maxTeams: t.maxTeams || 16,
            teamSize: t.teamSize || 11,
            prizePool: t.prizePool || '',
            rules: t.rules || '',
            requireAadhaarVerification: t.requireAadhaarVerification || false,
            status: t.status || 'REGISTRATION_OPEN',
            winner: t.winner || '',
            runnerUp: t.runnerUp || '',
            thirdPlace: t.thirdPlace || '',
          });
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && typeof v === 'object' && !(v instanceof File)) {
          data.append(k, JSON.stringify(v));
        } else {
          data.append(k, v);
        }
      });
      if (bannerFile) data.append('bannerImage', bannerFile);
      const res = await api.put(`/admin/tournaments/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setSuccess('Tournament updated successfully!');
        setTimeout(() => navigate('/admin/tournaments'), 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
      </div>
    );
  }

  if (!form) return <div className="text-rose-600 dark:text-rose-400 text-sm p-4">{error || 'Tournament not found.'}</div>;

  const fieldClass = "w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:border-amber-500 focus:outline-none";
  const labelClass = "block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

  return (
    <div className="space-y-6 max-w-[1400px] text-slate-900 dark:text-white">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/admin/tournaments')} className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">Edit Tournament</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">Admin override — changes apply to any organizer's tournament</p>
        </div>
      </div>

      {error && <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-300 flex gap-2"><ShieldAlert className="w-4 h-4 flex-shrink-0" />{error}</div>}
      {success && <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs text-emerald-700 dark:text-emerald-300 flex gap-2"><ShieldCheck className="w-4 h-4 flex-shrink-0" />{success}</div>}

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-8 shadow-sm text-slate-900 dark:text-white">
        {/* Basic Info */}
        <section className="space-y-4">
          <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">Tournament Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Tournament Name *</label>
              <input required name="name" value={form.name} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Sport</label>
              <select name="sport" value={form.sport} onChange={handleChange} className={fieldClass}>
                {SPORTS_LIST.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Format</label>
              <select name="format" value={form.format} onChange={handleChange} className={fieldClass}>
                {TOURNAMENT_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={fieldClass}>
                {statusOptions.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Exact Map Location</label>
              <LocationPicker 
                location={form.location}
                setLocation={(loc) => setForm(prev => ({ ...prev, location: loc }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea rows="3" name="description" value={form.description} onChange={handleChange} className={fieldClass} />
            </div>
          </div>
        </section>

        {/* Venue & Schedule */}
        <section className="space-y-4">
          <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">Venue & Schedule</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className={labelClass}>Stadium / Venue *</label>
              <input required name="venue" value={form.venue} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Start Date *</label>
              <input required type="date" name="startDate" value={form.startDate} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>End Date *</label>
              <input required type="date" name="endDate" value={form.endDate} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Daily Start Time</label>
              <input name="startTime" value={form.startTime} onChange={handleChange} className={fieldClass} placeholder="09:00 AM" />
            </div>
            <div>
              <label className={labelClass}>Registration Deadline</label>
              <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className={fieldClass} />
            </div>
          </div>
        </section>

        {/* Teams & Fee */}
        <section className="space-y-4">
          <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">Teams & Payment</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Max Teams</label>
              <input type="number" min="2" max="64" name="maxTeams" value={form.maxTeams} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Team Size</label>
              <input type="number" min="1" max="30" name="teamSize" value={form.teamSize} onChange={handleChange} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Registration Fee (₹)</label>
              <input type="number" min="0" name="registrationFee" value={form.registrationFee} onChange={handleChange} className={`${fieldClass} font-mono`} />
            </div>
            <div>
              <label className={labelClass}>UPI ID</label>
              <input name="upiId" value={form.upiId} onChange={handleChange} className={`${fieldClass} font-mono`} placeholder="upi@bank" />
            </div>
            <div className="col-span-2 sm:col-span-4">
              <label className={labelClass}>Prize Pool Info</label>
              <input name="prizePool" value={form.prizePool} onChange={handleChange} className={fieldClass} placeholder="1st: ₹50,000 | 2nd: ₹25,000" />
            </div>
          </div>
        </section>

        {/* Winners */}
        <section className="space-y-4">
          <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">Winners (if completed)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>🥇 1st Place / Champion</label>
              <input name="winner" value={form.winner} onChange={handleChange} className={fieldClass} placeholder="Team name" />
            </div>
            <div>
              <label className={labelClass}>🥈 2nd Place / Runner-Up</label>
              <input name="runnerUp" value={form.runnerUp} onChange={handleChange} className={fieldClass} placeholder="Team name" />
            </div>
            <div>
              <label className={labelClass}>🥉 3rd Place / Bronze</label>
              <input name="thirdPlace" value={form.thirdPlace} onChange={handleChange} className={fieldClass} placeholder="Team name" />
            </div>
          </div>
        </section>

        {/* Rules & Identity */}
        <section className="space-y-4">
          <h3 className="font-bold text-amber-700 dark:text-amber-400 text-sm border-b border-slate-200 dark:border-slate-800 pb-2">Rules & Verification</h3>
          <div>
            <label className={labelClass}>Rules & Regulations</label>
            <textarea rows="4" name="rules" value={form.rules} onChange={handleChange} className={fieldClass} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Require Aadhaar Verification
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">Players must upload an ID document when registering</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, requireAadhaarVerification: !prev.requireAadhaarVerification }))}
              className={`w-12 h-6 rounded-full relative flex items-center px-0.5 transition-colors ${form.requireAadhaarVerification ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'}`}
            >
              <span className={`w-5 h-5 rounded-full bg-white dark:bg-slate-200 shadow-xs transition-transform ${form.requireAadhaarVerification ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div>
            <label className={labelClass}>Replace Banner Image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setBannerFile(e.target.files[0])} className="w-full text-xs text-slate-600 dark:text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-slate-200 hover:file:bg-slate-200 dark:hover:file:bg-slate-700" />
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" onClick={() => navigate('/admin/tournaments')} className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">Cancel</button>
          <button type="submit" disabled={saving} className="px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditTournament;
