import React, { useState } from 'react';
import { Settings, ShieldCheck, User, Camera, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminSettings = () => {
  const { user, updateProfile, uploadProfilePhoto, removeProfilePhoto } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg(''); setErr('');
      await updateProfile({ name, phone });
      setMsg('Admin profile details updated successfully.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingPhoto(true);
      setMsg(''); setErr('');
      await uploadProfilePhoto(file);
      setMsg('Profile photo updated.');
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const avatarUrl = user?.profilePhoto || user?.profileImage;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-black text-2xl text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-slate-400" /> Admin Settings & Profile
        </h1>
        <p className="text-xs text-slate-400 mt-1">Manage your administrator identity</p>
      </div>

      {msg && <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">{msg}</div>}
      {err && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">{err}</div>}

      {/* Avatar Card */}
      <div className="rounded-2xl glass-card border border-slate-800 p-6 flex items-center gap-5">
        <div className="relative w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center font-bold text-xl text-rose-400 overflow-hidden flex-shrink-0">
          {avatarUrl ? <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">{user?.name}</h3>
          <p className="text-xs text-slate-400">{user?.email}</p>
          <div className="flex gap-2 mt-2">
            <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white cursor-pointer transition">
              {uploadingPhoto ? 'Uploading…' : 'Change Photo'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
            {avatarUrl && (
              <button onClick={removeProfilePhoto} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleUpdateProfile} className="rounded-2xl glass-panel border border-slate-800 p-6 space-y-4">
        <h3 className="font-bold text-white text-sm border-b border-slate-800 pb-2">Profile Information</h3>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="w-full px-3.5 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-500 cursor-not-allowed"
          />
          <span className="text-[10px] text-slate-500 mt-1 block">Email address cannot be modified</span>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:border-rose-500 focus:outline-none"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 transition"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
