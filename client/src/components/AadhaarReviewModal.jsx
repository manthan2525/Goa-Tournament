import React, { useState } from 'react';
import { X, Check, ShieldCheck, ShieldAlert, FileText, ExternalLink, AlertTriangle } from 'lucide-react';
import api from '../services/api';

const AadhaarReviewModal = ({ registration, onClose, onUpdated }) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isPdf = registration.aadhaarDocument?.toLowerCase().includes('.pdf') ||
    registration.aadhaarDocument?.startsWith('data:application/pdf');

  const handleVerify = async () => {
    try {
      setSubmitting(true);
      setError('');
      const res = await api.put(`/registrations/${registration._id}/aadhaar/verify`);
      if (res.data.success) {
        onUpdated(res.data.registration);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to verify Aadhaar document.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('A rejection reason is mandatory.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.put(`/registrations/${registration._id}/aadhaar/reject`, {
        reason: rejectionReason.trim(),
      });
      if (res.data.success) {
        onUpdated(res.data.registration);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to reject Aadhaar document.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col my-auto rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-7 space-y-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900">Aadhaar Document Verification</h3>
              <p className="text-xs text-slate-600 truncate max-w-[240px] sm:max-w-md">
                Team: <span className="text-emerald-700 font-bold">{registration.teamName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 flex-shrink-0">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start overflow-y-auto pr-1 flex-1">
          {/* Document Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Uploaded Aadhaar / ID Card
            </label>
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 aspect-video sm:aspect-square flex items-center justify-center group relative max-h-60 sm:max-h-none">
              {registration.aadhaarDocument ? (
                isPdf ? (
                  <div className="p-6 text-center space-y-3">
                    <FileText className="w-12 h-12 text-teal-600 mx-auto" />
                    <p className="text-xs text-slate-700 font-semibold">PDF Document Uploaded</p>
                    <a
                      href={registration.aadhaarDocument}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-teal-700 text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Document
                    </a>
                  </div>
                ) : (
                  <>
                    <img
                      src={registration.aadhaarDocument}
                      alt="Aadhaar Card"
                      className="w-full h-full object-contain"
                    />
                    <a
                      href={registration.aadhaarDocument}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute top-2 right-2 p-2 rounded-xl bg-white/90 text-slate-700 hover:text-slate-900 border border-slate-200 shadow-xs transition-opacity"
                      title="Open full image"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                )
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500/60" />
                  <p className="text-xs">No document uploaded yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Participant Info & Actions */}
          <div className="space-y-3 text-xs">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div>
                <p className="text-slate-500 font-medium">Captain / Player In-Charge</p>
                <p className="font-semibold text-slate-900 text-sm">{registration.captainName}</p>
                <p className="text-slate-600 font-mono">{registration.contactPhone}</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-slate-500 font-medium">Aadhaar Status</p>
                <span
                  className={`inline-block mt-1 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] border ${
                    registration.aadhaarVerificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : registration.aadhaarVerificationStatus === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                  }`}
                >
                  {registration.aadhaarVerificationStatus || 'PENDING'}
                </span>
              </div>

              {registration.aadhaarRejectionReason && (
                <div className="pt-2 border-t border-slate-200 text-rose-700">
                  <p className="text-slate-500 font-medium">Previous Rejection Reason</p>
                  <p className="italic text-[11px] mt-0.5">{registration.aadhaarRejectionReason}</p>
                </div>
              )}
            </div>

            {rejecting ? (
              <form onSubmit={handleReject} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">
                    Rejection Reason (Mandatory) *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Blurry photo, name mismatch, incomplete document..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRejecting(false)}
                    className="flex-1 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 min-h-[44px] text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={submitting || !registration.aadhaarDocument}
                  className="w-full py-3 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {submitting ? 'Verifying...' : 'Verify & Approve Aadhaar'}
                </button>

                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  className="w-full py-2.5 min-h-[44px] text-xs font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors flex items-center justify-center"
                >
                  Reject with Reason
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AadhaarReviewModal;
