import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  Calendar,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  FileText,
  X,
  ShieldAlert,
  Camera,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import { PAYMENT_STATUS_COLORS, formatLocation } from '../utils/constants';

const PlayerDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegForPayment, setSelectedRegForPayment] = useState(null);
  const [selectedRegForAadhaar, setSelectedRegForAadhaar] = useState(null);

  // Aadhaar re-upload state
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [uploadingAadhaar, setUploadingAadhaar] = useState(false);
  const [aadhaarError, setAadhaarError] = useState('');

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/registrations/my-registrations');
      if (res.data.success) {
        setRegistrations(res.data.registrations || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const handleAadhaarReupload = async (e) => {
    e.preventDefault();
    if (!aadhaarFile) {
      setAadhaarError('Please select a file to upload.');
      return;
    }

    try {
      setUploadingAadhaar(true);
      setAadhaarError('');
      const formData = new FormData();
      formData.append('aadhaarDocument', aadhaarFile);

      const res = await api.put(
        `/registrations/${selectedRegForAadhaar._id}/aadhaar`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (res.data.success) {
        setSelectedRegForAadhaar(null);
        setAadhaarFile(null);
        fetchMyRegistrations();
      }
    } catch (err) {
      setAadhaarError(err.message || 'Failed to re-upload Aadhaar document.');
    } finally {
      setUploadingAadhaar(false);
    }
  };

  const avatarUrl = user?.profilePhoto || user?.profileImage;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-slate-900 dark:text-white">
      {/* Header Profile Area */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm text-slate-900 dark:text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-display font-black text-2xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
            {avatarUrl ? (
              <img src={avatarUrl} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || 'P'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {user?.email} • {user?.phone || 'Goa, India'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors border border-slate-300 dark:border-slate-700"
          >
            Edit Profile &amp; Photo
          </Link>
          <Link
            to="/tournaments"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-all hover:scale-105 active:scale-95"
          >
            + Join Tournament
          </Link>
        </div>
      </div>

      {/* Registrations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            My Registered Teams &amp; Verification Status
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {registrations.length} Total Registrations
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : registrations.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {registrations.map((reg) => {
              const statusStyle =
                PAYMENT_STATUS_COLORS[reg.status] || PAYMENT_STATUS_COLORS.PENDING;
              const hasPayment = !!reg.payment;
              const isAadhaarRequired = reg.tournament?.requireAadhaarVerification;

              return (
                <div
                  key={reg._id}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all flex flex-col justify-between text-slate-900 dark:text-white"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                          {reg.tournament?.sport} Tournament
                        </span>
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                          {reg.tournament?.name}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide font-mono ${statusStyle.badge}`}>
                        Entry: {statusStyle.label}
                      </span>
                    </div>

                    {/* Verification Status Pill Badges */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Payment Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                          reg.paymentStatus === 'VERIFIED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                            : reg.paymentStatus === 'REJECTED'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                            : reg.paymentStatus === 'NOT_APPLICABLE'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                            : 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50'
                        }`}
                      >
                        Payment: {reg.paymentStatus || 'PENDING'}
                      </span>

                      {/* Aadhaar Status Badge */}
                      {isAadhaarRequired && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                            reg.aadhaarVerificationStatus === 'VERIFIED'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                              : reg.aadhaarVerificationStatus === 'REJECTED'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                              : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50'
                          }`}
                        >
                          Aadhaar: {reg.aadhaarVerificationStatus || 'PENDING'}
                        </span>
                      )}
                    </div>

                    {/* Team Details */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Team Name:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{reg.teamName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Captain / Contact:</span>
                        <span className="text-slate-800 dark:text-slate-200">{reg.captainName} ({reg.contactPhone})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Venue:</span>
                        <span className="text-slate-800 dark:text-slate-200">{reg.tournament?.venue}, {formatLocation(reg.tournament?.location)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Fee Amount:</span>
                        <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                          {reg.tournament?.registrationFee === 0
                            ? 'FREE ENTRY'
                            : `₹${reg.tournament?.registrationFee?.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                    </div>

                    {/* Aadhaar Rejection Notice */}
                    {reg.aadhaarVerificationStatus === 'REJECTED' && reg.aadhaarRejectionReason && (
                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-800 dark:text-rose-400 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                          Aadhaar Rejected:
                        </p>
                        <p className="text-[11px]">{reg.aadhaarRejectionReason}</p>
                      </div>
                    )}

                    {/* Payment Rejection Notice */}
                    {reg.paymentStatus === 'REJECTED' && reg.rejectionReason && (
                      <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-800 dark:text-rose-400 space-y-1">
                        <p className="font-bold flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                          <AlertCircle className="w-4 h-4" />
                          Payment Rejected:
                        </p>
                        <p className="text-[11px]">{reg.rejectionReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to={`/tournaments/${reg.tournament?._id}`}
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 flex items-center gap-1"
                    >
                      <span>View Tournament Tree</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Aadhaar Re-upload button if rejected or missing */}
                      {isAadhaarRequired && reg.aadhaarVerificationStatus === 'REJECTED' && (
                        <button
                          onClick={() => setSelectedRegForAadhaar(reg)}
                          className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Re-upload Aadhaar
                        </button>
                      )}

                      {/* Payment submit button if pending & not yet submitted */}
                      {reg.paymentStatus === 'PENDING' && !hasPayment && reg.tournament?.registrationFee > 0 && (
                        <button
                          onClick={() => setSelectedRegForPayment(reg)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Pay via UPI QR
                        </button>
                      )}

                      {/* Payment re-upload button if rejected */}
                      {reg.paymentStatus === 'REJECTED' && (
                        <button
                          onClick={() => setSelectedRegForPayment(reg)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Re-upload Payment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-3 shadow-xs text-slate-900 dark:text-white">
            <Trophy className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">No Registrations Yet</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
              You haven't joined any tournaments yet. Browse active competitions across Goa and register!
            </p>
            <Link
              to="/tournaments"
              className="inline-block px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
            >
              Browse Tournaments
            </Link>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {selectedRegForPayment && (
        <PaymentModal
          registration={selectedRegForPayment}
          tournament={selectedRegForPayment.tournament}
          onClose={() => setSelectedRegForPayment(null)}
          onSuccess={() => {
            setSelectedRegForPayment(null);
            fetchMyRegistrations();
          }}
        />
      )}

      {/* Aadhaar Re-upload Modal */}
      {selectedRegForAadhaar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-md my-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  Re-upload Aadhaar Document
                </h3>
              </div>
              <button
                onClick={() => setSelectedRegForAadhaar(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {aadhaarError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{aadhaarError}</span>
              </div>
            )}

            <form onSubmit={handleAadhaarReupload} className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-400">
                Please upload a clear, un-obscured photo or PDF of your Aadhaar card or government ID.
              </p>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-teal-300 dark:border-teal-800 hover:border-teal-400 rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center space-y-2">
                <FileText className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold">
                  {aadhaarFile ? aadhaarFile.name : 'Click to select Aadhaar Document (JPG, PNG, PDF)'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Max size: 10 MB</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => setAadhaarFile(e.target.files[0])}
                  className="hidden"
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedRegForAadhaar(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingAadhaar || !aadhaarFile}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-teal-600 hover:bg-teal-500 text-white shadow-xs disabled:opacity-50"
                >
                  {uploadingAadhaar ? 'Uploading...' : 'Submit Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerDashboard;
