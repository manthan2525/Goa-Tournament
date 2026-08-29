import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Camera,
  Trash2,
  Check,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShieldAlert,
  Save,
} from 'lucide-react';

const Profile = () => {
  const { user, updateProfile, uploadProfilePhoto, removeProfilePhoto } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || 'Goa, India');
  const [organizationName, setOrganizationName] = useState(user?.organizationName || '');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const avatarUrl = user?.profilePhoto || user?.profileImage;

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Profile photo must be less than 8 MB.');
      return;
    }

    try {
      setUploadingPhoto(true);
      setErrorMsg('');
      await uploadProfilePhoto(file);
      setSuccessMsg('Profile photo updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async () => {
    try {
      setUploadingPhoto(true);
      setErrorMsg('');
      await removeProfilePhoto();
      setSuccessMsg('Profile photo removed. Default avatar restored.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove profile photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      setErrorMsg('');
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        location: location.trim(),
        organizationName: organizationName.trim(),
      });
      setSuccessMsg('Profile information saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile changes.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Section */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden shadow-xs flex items-center justify-center text-3xl font-bold text-emerald-700">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>

            {/* Photo Action Overlay */}
            <label className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
              <Camera className="w-6 h-6 mb-1 text-white" />
              <span className="text-[10px] font-bold">Change</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* User Info Header */}
          <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-display font-black text-2xl text-slate-900 truncate">{user?.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  user?.role === 'ORGANIZER'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                }`}
              >
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-600 flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user?.email}</span>
            </p>
            {user?.organizationName && (
              <p className="text-xs text-slate-700 flex items-center justify-center sm:justify-start gap-1.5">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>{user.organizationName}</span>
              </p>
            )}

            {/* Photo Action Buttons */}
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-2">
              <label className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5 border border-slate-300">
                <Camera className="w-3.5 h-3.5 text-emerald-600" />
                <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                  className="hidden"
                />
              </label>

              {avatarUrl && (
                <button
                  onClick={handlePhotoRemove}
                  disabled={uploadingPhoto}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 border border-rose-200"
                  title="Restore default avatar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="font-display font-bold text-lg text-slate-900">Edit Profile Details</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Manage your personal profile, contact information, and organizer affiliation in Goa.
          </p>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Full Name *</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Contact Phone / WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  placeholder="e.g. +91 98221 XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Location in Goa</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Panaji, Goa"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {user?.role === 'ORGANIZER' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Club / Organization Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. Goa Football Association, Salcete Sports Trust"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">Bio / Profile Summary</label>
            <div className="relative">
              <textarea
                rows="3"
                placeholder="Tell participants about yourself, your club, or your sports interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:border-emerald-500 leading-relaxed placeholder-slate-400"
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
