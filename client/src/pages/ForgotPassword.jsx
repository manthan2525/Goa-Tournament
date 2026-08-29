import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Trophy, ArrowLeft, ShieldAlert, CheckCircle2, Send } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [devUrl, setDevUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setSubmitted(true);
        if (res.data.devResetUrl) {
          setDevUrl(res.data.devResetUrl);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl relative">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 group mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <span className="font-display font-black text-xl tracking-tight text-slate-900">
              GOA<span className="text-emerald-600">TOURNAMENT</span>
            </span>
          </Link>
          <h2 className="font-display font-bold text-2xl text-slate-900">Forgot Password</h2>
          <p className="text-xs text-slate-600 max-w-xs mx-auto">
            Enter your registered account email and we'll send you instructions to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Reset Link Sent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If an account with <span className="text-emerald-700 font-semibold">{email}</span> exists, you will receive password reset instructions shortly.
            </p>

            {devUrl && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
                <p className="text-[10px] uppercase font-bold text-emerald-700">Development Direct Link:</p>
                <a href={devUrl} className="text-blue-600 underline break-all font-mono">
                  {devUrl}
                </a>
              </div>
            )}

            <div className="pt-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs disabled:opacity-50 transition-all hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Sending Instructions...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
