import React, { useState } from 'react';
import { X, Check, AlertTriangle, ShieldCheck, ExternalLink, ShieldAlert } from 'lucide-react';
import api from '../services/api';

const PaymentReviewModal = ({ payment, onClose, onUpdated }) => {
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      setSubmitting(true);
      setError('');
      const res = await api.put(`/payments/${payment._id}/verify`);
      if (res.data.success) {
        onUpdated(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to verify payment.');
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
      const res = await api.put(`/payments/${payment._id}/reject`, {
        reason: rejectionReason.trim(),
      });
      if (res.data.success) {
        onUpdated(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to reject payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col my-auto rounded-2xl glass-panel border border-slate-700 shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-white">Payment Verification</h3>
            <p className="text-xs text-slate-400 truncate max-w-[240px] sm:max-w-md">
              Team: <span className="text-emerald-400 font-semibold">{payment.registration?.teamName}</span>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-start overflow-y-auto pr-1 flex-1">
          {/* Screenshot Preview */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Uploaded Screenshot
            </label>
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video sm:aspect-square flex items-center justify-center group relative max-h-60 sm:max-h-none">
              <img
                src={payment.screenshotUrl}
                alt="UPI Receipt"
                className="w-full h-full object-contain"
              />
              <a
                href={payment.screenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute top-2 right-2 p-2 rounded-xl bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 transition-opacity"
                title="Open full image"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="space-y-3.5 text-xs">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div>
                <p className="text-slate-500 font-medium">Captain / Contact</p>
                <p className="font-semibold text-white text-sm">{payment.registration?.captainName || payment.user?.name}</p>
                <p className="text-slate-400 font-mono">{payment.registration?.contactPhone || payment.user?.phone}</p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-slate-500 font-medium">UPI Transaction ID / UTR</p>
                <p className="font-mono font-bold text-emerald-400 text-sm break-all">
                  {payment.transactionId}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-slate-500 font-medium">Amount Received</p>
                <p className="font-mono font-black text-white text-base">
                  ₹{payment.amount?.toLocaleString('en-IN')}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <p className="text-slate-500 font-medium">Current Status</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                  {payment.status}
                </span>
              </div>
            </div>

            {rejecting ? (
              <form onSubmit={handleReject} className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1">
                    Rejection Reason (Mandatory) *
                  </label>
                  <textarea
                    required
                    rows="3"
                    placeholder="e.g. Invalid UTR, transaction amount mismatch, illegible screenshot..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-rose-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  ></textarea>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRejecting(false)}
                    className="flex-1 py-2.5 min-h-[44px] text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-xl flex items-center justify-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2.5 min-h-[44px] text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center"
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
                  disabled={submitting}
                  className="w-full py-3 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  {submitting ? 'Verifying...' : 'Accept & Confirm Team'}
                </button>

                <button
                  type="button"
                  onClick={() => setRejecting(true)}
                  className="w-full py-2.5 min-h-[44px] text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 rounded-xl transition-colors flex items-center justify-center"
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

export default PaymentReviewModal;
