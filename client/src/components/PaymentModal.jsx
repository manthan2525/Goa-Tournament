import React, { useState } from 'react';
import { X, QrCode, Copy, Check, Upload, ShieldAlert, CheckCircle } from 'lucide-react';
import api from '../services/api';

const PaymentModal = ({ registration, tournament, onClose, onSuccess }) => {
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  const upiId = tournament?.upiId || 'goasports@upi';
  const qrUrl =
    tournament?.qrCode ||
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(
      upiId
    )}&pn=GoaTournament&am=${tournament?.registrationFee || 0}&cu=INR`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!transactionId.trim()) {
      setError('Please provide the UPI Transaction ID / UTR number.');
      return;
    }

    if (!screenshotFile) {
      setError('Please upload the payment confirmation screenshot.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('registrationId', registration._id);
      formData.append('transactionId', transactionId.trim());
      formData.append('screenshot', screenshotFile);

      const res = await api.post('/payments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setCompleted(true);
        setTimeout(() => {
          onSuccess(res.data);
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Payment submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col my-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-7 space-y-4 sm:space-y-5 overflow-hidden text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 flex-shrink-0">
          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white">Scan &amp; Pay via UPI</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              Entry Fee: ₹{tournament?.registrationFee?.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {completed ? (
          <div className="py-8 text-center space-y-3 flex-1 flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-slate-900 dark:text-white">Payment Proof Submitted!</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto">
              Your payment status is now <span className="text-amber-700 dark:text-amber-400 font-bold">PENDING</span>. The organizer will verify the screenshot and confirm your squad slot.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-xs text-rose-700 dark:text-rose-400 flex items-start gap-2 flex-shrink-0">
                <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* QR Code & UPI Card */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center space-y-2.5">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <img
                  src={qrUrl}
                  alt="UPI QR Code"
                  className="w-36 h-36 sm:w-44 sm:h-44 object-contain"
                />
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400">
                Scan with Google Pay, PhonePe, Paytm, BHIM, or any UPI App
              </p>

              {/* UPI ID Pill */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full justify-between shadow-xs">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 truncate">{upiId}</span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                UPI Transaction ID / UTR (12 digits) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 429381729012"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Screenshot Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Upload Payment Screenshot Proof *
              </label>
              <label className="flex flex-col items-center justify-center p-3.5 sm:p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {previewUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Payment Preview"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-300 dark:border-slate-700 flex-shrink-0"
                    />
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">Screenshot selected</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Click to replace image</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">Click to upload screenshot</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">PNG, JPG, JPEG up to 8MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 min-h-[44px] rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all flex items-center justify-center"
              >
                {submitting ? 'Verifying Upload...' : 'Submit Payment Proof'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
